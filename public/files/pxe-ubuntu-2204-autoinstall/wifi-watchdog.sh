#!/bin/sh
set -eu

IFACE="<WIFI_INTERFACE>"
GATEWAY="<LAN_GATEWAY>"
SSID_5G="<WIFI_SSID_5G>"
SSID_FALLBACK="<WIFI_SSID_FALLBACK>"
LOG_TAG="wifi-watchdog"

get_field() {
  wpa_cli -i "$IFACE" status 2>/dev/null | awk -F= -v key="$1" '$1 == key {print $2; exit}'
}

ssid="$(get_field ssid)"
state="$(get_field wpa_state)"
addr="$(ip -4 -o addr show dev "$IFACE" scope global 2>/dev/null | awk '{print $4; exit}')"

case "$ssid" in
  "$SSID_5G"|"$SSID_FALLBACK") expected_ssid=1 ;;
  *) expected_ssid=0 ;;
esac

if [ "$state" = "COMPLETED" ] &&
   [ -n "$addr" ] &&
   [ "$expected_ssid" = "1" ]; then
  if ping -I "$IFACE" -c 1 -W 3 "$GATEWAY" >/dev/null 2>&1; then
    logger -t "$LOG_TAG" "ok iface=$IFACE ssid=$ssid addr=$addr gateway=$GATEWAY"
  else
    logger -t "$LOG_TAG" "ok iface=$IFACE ssid=$ssid addr=$addr gateway-ping=failed"
  fi
  exit 0
fi

logger -t "$LOG_TAG" "recover iface=$IFACE state=${state:-none} ssid=${ssid:-none} addr=${addr:-none}"
/usr/sbin/netplan apply || true
systemctl restart netplan-wpa-"$IFACE".service || true
sleep 8

ssid="$(get_field ssid)"
state="$(get_field wpa_state)"
addr="$(ip -4 -o addr show dev "$IFACE" scope global 2>/dev/null | awk '{print $4; exit}')"
logger -t "$LOG_TAG" "after-recover state=${state:-none} ssid=${ssid:-none} addr=${addr:-none}"
