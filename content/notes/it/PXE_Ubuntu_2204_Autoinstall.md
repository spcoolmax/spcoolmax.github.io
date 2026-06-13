---
title: "一次 Ubuntu 22.04 PXE 自动安装记录"
category: "IT"
tags: ["Linux", "PXE", "Ubuntu", "Network"]
date: "2026-06-13"
---

这次给一台没有现成系统的机器装 Ubuntu 22.04，目标是尽量不要在目标机器前面手动点安装器：从网卡 PXE 启动，自动拉 Ubuntu Server 安装镜像和 autoinstall 配置，直接覆盖整块硬盘，装完之后再把 Wi-Fi、静态 IP 和一个简单的 watchdog 配好。

这里记录一下完整过程。涉及密码的地方都做了脱敏，不要把 sudo 密码、系统登录密码、Wi-Fi 密码这种东西写进公开仓库。

## 网络拓扑

现场网络里已经有一个路由器在发 DHCP，所以 PXE 服务器不能再开一个完整 DHCP，否则很容易把整个网段搞乱。最后采用的是 `dnsmasq` 的 proxy-DHCP 模式：

* 路由器继续负责普通 DHCP。
* PXE 服务器只回答指定 MAC 的 PXE 请求。
* TFTP 用来发 bootloader、kernel、initrd。
* HTTP 用来发 Ubuntu ISO 和 NoCloud autoinstall seed。

PXE 服务器在有线网卡上监听，IP 是实验室内网地址。目标机先从 IPv4 PXE 启动，安装完成之后再关闭 PXE 服务，避免机器重启后再次进入网络安装。

## 基础组件

服务器上需要这些东西：

```bash
sudo apt install dnsmasq nginx syslinux-common pxelinux shim-signed grub-efi-amd64-signed
```

目录大致是这样：

```text
/srv/pxe/
  ubuntu-22.04.5-live-server-amd64.iso
  ubuntu-22.04/
    user-data
    meta-data
    vendor-data

/srv/tftp/
  grubx64.efi
  ubuntu-22.04/
    vmlinuz
    initrd
```

HTTP 用 nginx 暴露：

```bash
sudo ln -s /srv/pxe /var/www/html/pxe
```

ISO 下载之后最好先校验 SHA256。PXE 安装失败时，坏 ISO 会制造很多误导性的现象，先把镜像可靠性排掉比较省时间。

## dnsmasq 只服务目标机器

`dnsmasq` 的关键点是 proxy-DHCP 和 MAC 白名单：

```conf
port=0
interface=enp7s0
bind-interfaces
log-dhcp

dhcp-range=192.168.2.0,proxy,255.255.255.0
dhcp-host=68:1d:ef:5c:xx:xx,set:pxe_target
dhcp-ignore=tag:!pxe_target

enable-tftp
tftp-root=/srv/tftp

dhcp-match=set:efi-x86_64,option:client-arch,7
dhcp-match=set:efi-x86_64,option:client-arch,9
dhcp-match=set:bios,option:client-arch,0

dhcp-boot=tag:pxe_target,tag:efi-x86_64,grubx64.efi
pxe-service=tag:pxe_target,tag:efi-x86_64,X86-64_EFI,"Install Ubuntu Server 22.04 LTS",grubx64.efi
```

这里没有让 `dnsmasq` 做 DNS，也没有让它分配 IP。它只告诉目标机：如果你是这个 MAC，而且你在做 PXE，那就去这个 TFTP server 拿启动文件。

## 直接嵌入 GRUB 配置

一开始目标机多次掉进 `grub>`。这种情况通常说明 UEFI 已经拿到了 GRUB，但是 GRUB 没找到配置，或者配置里路径不对。

最后的处理办法是生成一个带 embedded config 的 GRUB EFI 文件，把启动命令直接塞进 `grubx64.efi`：

```grub
set net_default_server=192.168.2.61
set root=(tftp,192.168.2.61)
linux /ubuntu-22.04/vmlinuz ip=dhcp url=http://192.168.2.61/pxe/ubuntu-22.04.5-live-server-amd64.iso autoinstall ds=nocloud-net\;s=http://192.168.2.61/pxe/ubuntu-22.04/
initrd /ubuntu-22.04/initrd
boot
```

生成 EFI：

```bash
grub-mkimage -O x86_64-efi \
  -o grubx64-direct.efi \
  -p '(tftp,192.168.2.61)/grub' \
  -c embedded-grub.cfg \
  efinet tftp net linux linuxefi gzio boot echo all_video video efi_gop normal configfile

sudo cp grubx64-direct.efi /srv/tftp/grubx64.efi
```

这一步之后，日志里可以看到目标机依次拉走了：

```text
/srv/tftp/grubx64.efi
/srv/tftp/ubuntu-22.04/vmlinuz
/srv/tftp/ubuntu-22.04/initrd
```

然后 nginx 日志里能看到它继续从 HTTP 拉 ISO 和 NoCloud seed。这个时候基本就能确认 PXE 链路打通了。

## autoinstall seed

`user-data` 用 Ubuntu Server 的 autoinstall 格式。下面是脱敏版本：

```yaml
#cloud-config
autoinstall:
  version: 1
  locale: en_US.UTF-8
  keyboard:
    layout: us
  identity:
    hostname: ubuntu-5c9d55
    username: hislab
    password: "$6$..."
  ssh:
    install-server: true
    allow-pw: true
  storage:
    layout:
      name: lvm
  packages:
    - openssh-server
  updates: security
  late-commands:
    - curtin in-target --target=/target -- systemctl enable ssh
```

这里有几个坑：

1. `password` 不是明文，要用 SHA-512 crypt hash，例如 `openssl passwd -6` 生成。
2. `storage.layout.name: lvm` 会覆盖硬盘，但 Ubuntu 的默认 LVM 根分区不一定吃满全盘。
3. `vendor-data` 最好也放一个空文件，不然日志里会看到 404。通常不是致命问题，但排障时会干扰视线。

安装完成后，默认根分区只有 100G，VG 里还有大量空闲空间。手动扩到全盘：

```bash
sudo lvextend -r -l +100%FREE /dev/ubuntu-vg/ubuntu-lv
```

最后 `/` 变成约 466G，符合 512GB SSD 的实际可用容量。

## 安装完成后立刻关闭 PXE

这是非常重要的一步。目标机装完重启，如果 BIOS/UEFI 里 PXE 还排在硬盘前面，它会再次从网络启动。轻则又进 GRUB，重则又开始重装。

确认系统能 SSH 登录之后，立刻停掉 PXE：

```bash
sudo systemctl stop dnsmasq
sudo systemctl disable dnsmasq
```

这次看到目标机重启后 SSH host key 变化，说明它已经不是 installer live environment，而是新装好的系统。重新接受新的 host key 后，SSH 登录确认：

```text
hostname: ubuntu-5c9d55
OS: Ubuntu 22.04.5 LTS
disk: nvme0n1, root LV expanded to full disk
```

## Wi-Fi 自动连接和静态 IP

装好系统后，有线可以先用来管理机器，再配置 Wi-Fi。目标机的无线网卡是 Realtek RTL8821CE，接口名是 `wlp3s0`。

先扫描：

```bash
sudo wpa_cli -i wlp3s0 scan
sudo wpa_cli -i wlp3s0 scan_results
```

这次实际扫到了 `ASUS_5G` 和 `ASUS`。SSID 是区分大小写的，前面误写成 `asus_5g` 时连不上，所以最后把三个名字都保留在配置里，优先连真正的 5G：

```yaml
network:
  version: 2
  renderer: networkd
  wifis:
    wlp3s0:
      optional: true
      dhcp4: false
      addresses:
        - 192.168.2.160/24
      routes:
        - to: default
          via: 192.168.2.1
          metric: 600
      nameservers:
        addresses:
          - 192.168.2.1
          - 8.8.8.8
      access-points:
        "ASUS_5G":
          password: "<redacted>"
        "ASUS":
          password: "<redacted>"
        "asus_5g":
          password: "<redacted>"
```

因为系统最初的 netplan 文件是 cloud-init 生成的，还要禁用 cloud-init 后续覆盖网络配置：

```bash
sudo sh -c 'printf "network: {config: disabled}\n" > /etc/cloud/cloud.cfg.d/99-disable-network-config.cfg'
```

应用：

```bash
sudo netplan generate
sudo netplan apply
```

最后确认 Wi-Fi 是静态 IP，而不是 DHCP：

```text
wlp3s0: 192.168.2.160/24
default via 192.168.2.1 dev wlp3s0 proto static metric 600
SSID: ASUS_5G
```

## Wi-Fi watchdog

为了避免机器换位置或 AP 抖动后无线断开，额外加了一个很小的 systemd timer。它每分钟检查一次：

* `wpa_state` 是否是 `COMPLETED`
* 当前 SSID 是否是允许的 ASUS SSID
* `wlp3s0` 是否有 IPv4 地址

如果这些条件不满足，就执行：

```bash
netplan apply
systemctl restart netplan-wpa-wlp3s0.service
```

这里有个细节：不要把一次 ping 失败当作必须重启 Wi-Fi 的条件。无线网络偶尔丢一个包很正常，如果 watchdog 太激进，反而会把本来可用的连接反复打断。所以最终逻辑是：连接状态和 IP 正常就不重启，ping 失败只写日志。

timer：

```ini
[Timer]
OnBootSec=2min
OnUnitActiveSec=1min
AccuracySec=15s
Persistent=true
```

验证：

```text
wifi-watchdog.timer: active
wifi-watchdog.service: exited with status 0
log: ok iface=wlp3s0 ssid=ASUS_5G addr=192.168.2.160/24 gateway=192.168.2.1
```

## 排障顺序

这次比较有用的排障顺序是：

1. 先看 `dnsmasq` 日志，确认 PXE DHCP 请求是否来自目标 MAC。
2. 再看 TFTP 日志，确认 `grubx64.efi`、`vmlinuz`、`initrd` 是否被取走。
3. 再看 nginx access log，确认 ISO、`meta-data`、`user-data` 是否被取走。
4. 如果卡在 `grub>`，优先怀疑 GRUB 没拿到配置，而不是硬盘问题。
5. 安装完成后，第一时间停掉 PXE，避免重启循环。
6. Wi-Fi 先扫描真实 SSID，再写 netplan。SSID 大小写不要靠记忆。
7. 静态 IP 配好后，用 `ip route` 看 `proto static`，不要只看地址刚好没变。

整体来看，PXE 自动安装并不复杂，复杂的是每一层都可能“看起来启动了，但其实只走到一半”。把 DHCP、TFTP、HTTP、cloud-init、installer、目标系统这几层分别验证，问题会清楚很多。
