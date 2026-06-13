#!/bin/sh
set -eu

grub-mkimage -O x86_64-efi \
  -o grubx64-direct.efi \
  -p "(tftp,<PXE_SERVER_IP>)/grub" \
  -c embedded-grub.cfg \
  efinet tftp net linux linuxefi gzio boot echo all_video video efi_gop normal configfile

install -m 0644 grubx64-direct.efi /srv/tftp/grubx64.efi
