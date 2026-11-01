#!/usr/bin/env bash
# Guarda en ~/evidencias/ la salida de los comandos que pide la práctica (ec2-frontend).
# Uso: bash evidencias-suricata.sh   -> luego toma captura o pega el .txt en la memoria.
OUT=~/evidencias/suricata-$(date +%Y%m%d-%H%M%S).txt; mkdir -p ~/evidencias
run() { echo -e "\n===== \$ $* =====" | tee -a "$OUT"; eval "$@" 2>&1 | tee -a "$OUT"; }
run cat /etc/os-release
run ip -br address
run ip route
run suricata --build-info \| head -n 5
run "grep -nE 'HOME_NET:|EXTERNAL_NET:|- interface:|default-rule-path|atalaya-' /etc/suricata/suricata.yaml"
run ls -la /var/lib/suricata/rules/
run cat /var/lib/suricata/rules/atalaya-*.rules
run sudo suricata -T -c /etc/suricata/suricata.yaml -v \| tail -n 15
run sudo systemctl status suricata --no-pager
run sudo journalctl -u suricata -n 30 --no-pager
run sudo systemctl status atalaya-agente --no-pager
run sudo tail -n 20 /var/log/suricata/fast.log
echo -e "\nGuardado en $OUT"
