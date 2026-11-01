#!/usr/bin/env python3
"""
Agente IDS de Atalaya (corre en ec2-frontend).

1. Lee /var/log/suricata/eve.json como "tail -f" y envía cada alerta al backend
   por el peering (POST /api/internal/ids/suricata).
2. Cada 30 s manda un "latido" con el estado del servicio de Suricata.
3. Consulta el feed del backend (alertas de Snort y de Suricata ya normalizadas)
   y las publica en el grupo de Telegram, agrupando las repetidas.
4. Publica también los ACCESOS al sitio (inicios de sesión, intentos fallidos, accesos denegados)
   que registra la auditoría de la API.
5. Responde en el grupo a /estado, /ultimas, /accesos y /ayuda.

Solo usa la biblioteca estándar de Python 3 (no hay que instalar nada con pip).
Configuración: variables de entorno (archivo /etc/atalaya/agente.env, ver agente.env.example).
"""
import json
import os
import socket
import subprocess
import sys
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
from collections import deque
from html import escape

ENV = os.environ
BACKEND = ENV.get("ATALAYA_BACKEND_URL", "http://10.0.128.10:3000").rstrip("/")
KEY = ENV.get("ATALAYA_INGEST_KEY", "")
EVE = ENV.get("SURICATA_EVE", "/var/log/suricata/eve.json")
TOKEN = ENV.get("TELEGRAM_BOT_TOKEN", "")
CHAT_ID = ENV.get("TELEGRAM_CHAT_ID", "")
SID_MIN = int(ENV.get("SURICATA_SID_MIN", "1100000"))  # solo nuestras reglas locales
SID_MAX = int(ENV.get("SURICATA_SID_MAX", "1199999"))
COOLDOWN = int(ENV.get("TELEGRAM_COOLDOWN_SECONDS", "20"))  # agrupa alertas iguales
POLL = float(ENV.get("POLL_SECONDS", "2"))
# Eventos de auditoría que se publican (TOKEN_REJECTED se omite: aparece cada vez que expira una sesión)
AUDIT_TYPES = set(ENV.get("TELEGRAM_AUDIT_TYPES", "LOGIN_SUCCESS,LOGIN_FAILURE,LOGOUT,ACCESS_DENIED,SERVICE_KEY_REJECTED,IDS_RESET").split(","))

OBJETIVOS = {
    "icmp": "Objetivo 1 · ICMP (ping)",
    "sniffer": "Objetivo 2 · Sniffer (Wireshark)",
    "nmap": "Objetivo 3 · Nmap",
    "web": "Ampliación · sqlmap / fuerza bruta",
}
SENSORES = {"suricata": "🛰️ Suricata · NIDS frontend", "snort": "🐷 Snort · HIDS backend"}
PRIORIDAD = {1: "🔴 Alta", 2: "🟠 Media", 3: "🔵 Baja", 4: "⚪ Informativa"}

state = {"telegram": "sin-configurar" if not (TOKEN and CHAT_ID) else "ok", "eve": {"status": "starting"}}


def log(msg):
    print(time.strftime("%H:%M:%S"), msg, flush=True)


# ---------------- HTTP ----------------
def http(method, url, body=None, headers=None, timeout=10):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method=method, headers={"Content-Type": "application/json", **(headers or {})})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        raw = r.read()
        return json.loads(raw) if raw else None


def backend(method, path, body=None):
    return http(method, f"{BACKEND}/api/internal{path}", body, {"X-Atalaya-Key": KEY})


def telegram(method, params, timeout=15):
    data = urllib.parse.urlencode(params).encode()
    req = urllib.request.Request(f"https://api.telegram.org/bot{TOKEN}/{method}", data=data)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read())


def send(text):
    if not (TOKEN and CHAT_ID):
        log("Telegram sin configurar; mensaje: " + text.replace("\n", " | ")[:160])
        return
    try:
        telegram("sendMessage", {"chat_id": CHAT_ID, "text": text, "parse_mode": "HTML", "disable_web_page_preview": "true"})
        state["telegram"] = "ok"
    except urllib.error.HTTPError as e:
        state["telegram"] = f"error {e.code}"
        log(f"Telegram respondió {e.code}: {e.read()[:200]!r}")
        if e.code == 429:
            time.sleep(5)
    except Exception as e:  # sin red, DNS, etc.
        state["telegram"] = "sin-red"
        log(f"No se pudo enviar a Telegram: {e}")


# ---------------- 1. Suricata -> backend ----------------
def tail_eve():
    """Sigue eve.json; soporta rotación (logrotate) y truncado."""
    pending = deque(maxlen=2000)
    inode, offset, buf = None, None, ""
    while True:
        try:
            st = os.stat(EVE)
            if offset is None:
                offset = st.st_size  # al arrancar, solo lo nuevo
            elif st.st_ino != inode or st.st_size < offset:
                offset, buf = 0, ""
            inode = st.st_ino
            if st.st_size > offset:
                with open(EVE, "r", encoding="utf-8", errors="replace") as f:
                    f.seek(offset)
                    chunk = f.read()
                    offset = f.tell()
                lines = (buf + chunk).split("\n")
                buf = lines.pop()
                for line in lines:
                    try:
                        e = json.loads(line)
                    except ValueError:
                        continue
                    sid = e.get("alert", {}).get("signature_id")
                    if e.get("event_type") == "alert" and isinstance(sid, int) and SID_MIN <= sid <= SID_MAX:
                        pending.append(compact(e))
            state["eve"] = {"status": "ok"}
        except FileNotFoundError:
            state["eve"] = {"status": "missing", "error": "ENOENT"}
        except PermissionError:
            state["eve"] = {"status": "forbidden", "error": "EACCES"}

        while pending:
            batch = [pending.popleft() for _ in range(min(50, len(pending)))]
            try:
                backend("POST", "/ids/suricata", {"events": batch})
            except Exception as ex:
                log(f"Backend no disponible ({ex}); reintento en 5 s")
                pending.extendleft(reversed(batch))
                time.sleep(5)
                break
        time.sleep(POLL / 2)


def compact(e):
    """Solo los campos que necesita el backend (eve.json trae mucho más)."""
    a = e.get("alert", {})
    out = {k: e.get(k) for k in ("timestamp", "event_type", "src_ip", "src_port", "dest_ip", "dest_port", "proto")}
    out["alert"] = {k: a.get(k) for k in ("gid", "signature_id", "rev", "signature", "category", "severity")}
    h = e.get("http")
    if isinstance(h, dict):
        out["http"] = {k: h.get(k) for k in ("hostname", "url", "http_user_agent", "http_method")}
    return out


# ---------------- 2. Latido ----------------
def heartbeat():
    while True:
        try:
            service = subprocess.run(["systemctl", "is-active", "suricata"], capture_output=True, text=True, timeout=3).stdout.strip() or "unknown"
            version = subprocess.run(["suricata", "-V"], capture_output=True, text=True, timeout=5).stdout.strip()[:60]
        except Exception:
            service, version = "unknown", None
        try:
            backend("POST", "/ids/heartbeat", {
                "sensor": "suricata", "service": service, "version": version,
                "telegram": state["telegram"], "log": {"path": EVE, **state["eve"]},
            })
        except Exception as ex:
            log(f"Latido fallido: {ex}")
        time.sleep(30)


# ---------------- 3. Feed -> Telegram ----------------
def fmt_ep(ip, port):
    return f"{ip}:{port}" if ip and port else (ip or "—")


def render(a, extra_count=0):
    rule = a.get("rule") or {}
    lines = [
        f"🚨 <b>{escape(SENSORES.get(a['sensor'], a['sensor']))}</b>",
        f"<b>{escape(a['message'])}</b>",
        f"SID <code>{a['sid']}</code> · {escape(a.get('protocol') or '—')} · {PRIORIDAD.get(a.get('priority'), 'Sin prioridad')}",
        f"<code>{escape(fmt_ep(a.get('srcIp'), a.get('srcPort')))} → {escape(fmt_ep(a.get('dstIp'), a.get('dstPort')))}</code>",
    ]
    if a.get("objective"):
        lines.append(f"🎯 {OBJETIVOS.get(a['objective'], a['objective'])}")
    if rule.get("trigger"):
        lines.append(f"<i>{escape(rule['trigger'])}</i>")
    if extra_count:
        lines.append(f"➕ {extra_count} alertas iguales agrupadas en los últimos {COOLDOWN} s")
    lines.append(f"🕒 {escape(a['timestamp'][11:19])} UTC")
    return "\n".join(lines)


def feed_loop():
    cursor = None
    last_sent = {}   # (sensor, sid, src) -> hora del último envío
    suppressed = {}  # (sensor, sid, src) -> cuántas se agruparon
    while True:
        try:
            q = "" if cursor is None else f"?after={cursor}&limit=50"
            data = backend("GET", f"/ids/feed{q}")
            if cursor is None:
                log(f"Conectado al backend; cursor inicial {data['cursor']}")
            else:
                for a in data["alerts"]:
                    key = (a["sensor"], a["sid"], a.get("srcIp"))
                    now = time.time()
                    if now - last_sent.get(key, 0) < COOLDOWN:
                        suppressed[key] = suppressed.get(key, 0) + 1
                        continue
                    send(render(a, suppressed.pop(key, 0)))
                    last_sent[key] = now
            cursor = data["cursor"]
        except Exception as ex:
            log(f"Feed no disponible: {ex}")
            time.sleep(5)
        time.sleep(POLL)


# ---------------- 4. Accesos al sitio -> Telegram ----------------
ROLES = {"admin": "Administración", "analyst": "Analista", "client": "Cliente"}
AUDIT_FMT = {
    "LOGIN_SUCCESS": ("🔐", "Inicio de sesión"),
    "LOGIN_FAILURE": ("⚠️", "Intento de inicio de sesión fallido"),
    "LOGOUT": ("🚪", "Cierre de sesión (token revocado)"),
    "ACCESS_DENIED": ("⛔", "Acceso denegado por rol"),
    "TOKEN_REJECTED": ("🚫", "Token rechazado"),
    "SERVICE_KEY_REJECTED": ("🛑", "Clave del agente rechazada (¿intento de inyectar alertas?)"),
    "IDS_RESET": ("♻️", "Contadores del IDS reiniciados"),
    "INPUT_REJECTED": ("🧪", "Entrada rechazada por validación"),
}


def render_audit(e, extra_count=0):
    icon, title = AUDIT_FMT.get(e["type"], ("ℹ️", e["type"]))
    detail = e.get("detail") or ""
    if e["type"] == "LOGIN_SUCCESS" and detail.startswith("Rol "):
        detail = "Rol: " + ROLES.get(detail[4:], detail[4:])
    lines = [
        f"{icon} <b>{escape(title)}</b>",
        f"👤 Usuario: <code>{escape(e.get('username') or '—')}</code>",
        f"🌐 IP de origen: <code>{escape(e.get('ip') or '—')}</code>",
    ]
    if e.get("path"):
        lines.append(f"📍 Ruta: <code>{escape(e['path'])}</code>")
    if detail:
        lines.append(f"<i>{escape(detail)}</i>")
    if extra_count:
        lines.append(f"➕ {extra_count} eventos iguales agrupados en los últimos {COOLDOWN} s")
    lines.append(f"🕒 {escape(e['timestamp'][11:19])} UTC")
    return "\n".join(lines)


def audit_loop():
    cursor, last_sent, suppressed = None, {}, {}
    while True:
        try:
            q = "" if cursor is None else f"?after={cursor}&limit=50"
            data = backend("GET", f"/audit/feed{q}")
            if cursor is not None:
                for e in data["events"]:
                    if e["type"] not in AUDIT_TYPES:
                        continue
                    key = (e["type"], e.get("ip"), e.get("username"))
                    now = time.time()
                    if e["type"] == "LOGIN_FAILURE" and now - last_sent.get(key, 0) < COOLDOWN:
                        suppressed[key] = suppressed.get(key, 0) + 1  # fuerza bruta: se agrupa
                        continue
                    send(render_audit(e, suppressed.pop(key, 0)))
                    last_sent[key] = now
            cursor = data["cursor"]
        except Exception as ex:
            log(f"Feed de auditoría no disponible: {ex}")
            time.sleep(5)
        time.sleep(POLL)


def accesses_text():
    cur = backend("GET", "/audit/feed")["cursor"]
    events = backend("GET", f"/audit/feed?after={max(0, cur - 8)}&limit=8")["events"]
    if not events:
        return "Sin accesos registrados todavía."
    out = ["🧾 <b>Últimos accesos al sitio</b>"]
    for e in events:
        icon, title = AUDIT_FMT.get(e["type"], ("ℹ️", e["type"]))
        out.append(f"{icon} {escape(e['timestamp'][11:19])} · <code>{escape(e.get('username') or '—')}</code> · {escape(title)} · {escape(e.get('ip') or '—')}")
    return "\n".join(out)


# ---------------- 5. Comandos del grupo ----------------
def commands_loop():
    if not (TOKEN and CHAT_ID):
        return
    offset = 0
    while True:
        try:
            r = telegram("getUpdates", {"timeout": 25, "offset": offset}, timeout=35)
            for u in r.get("result", []):
                offset = u["update_id"] + 1
                msg = u.get("message") or {}
                if str(msg.get("chat", {}).get("id")) != str(CHAT_ID):
                    continue  # solo responde al grupo configurado
                text = (msg.get("text") or "").split("@")[0].strip().lower()
                if text == "/estado":
                    send(status_text())
                elif text == "/ultimas":
                    send(last_text())
                elif text == "/accesos":
                    send(accesses_text())
                elif text in ("/ayuda", "/start", "/help"):
                    send("🛡️ <b>Atalaya · IDS</b>\n/estado — sensores y pruebas detectadas\n/ultimas — últimas 5 alertas\n/accesos — últimos inicios de sesión y accesos denegados\nLas alertas y los accesos nuevos llegan solos a este grupo.")
        except Exception as ex:
            log(f"getUpdates falló: {ex}")
            time.sleep(5)


def status_text():
    s = backend("GET", "/ids/status")
    lines = ["📡 <b>Estado de Atalaya</b>"]
    for sensor in s["sensors"]:
        svc = (sensor.get("status") or {}).get("service", "?")
        icon = "🟢" if svc == "active" else "🔴"
        lines.append(f"{icon} {escape(SENSORES.get(sensor['id'], sensor['id']))}: {escape(svc)} · {sensor['alertCount']} alertas")
    lines.append("")
    for o in s["objectives"]:
        lines.append(f"{'✅' if o['detected'] else '⬜'} {escape(o['title'])}")
    lines.append(f"\nTotal: {s['totals']['all']} alertas ({s['totals']['lastHour']} en la última hora)")
    return "\n".join(lines)


def last_text():
    d = backend("GET", "/ids/feed")  # devuelve el cursor actual
    cur = d["cursor"]
    alerts = backend("GET", f"/ids/feed?after={max(0, cur - 5)}&limit=5")["alerts"]
    if not alerts:
        return "Sin alertas todavía."
    return "🧾 <b>Últimas alertas</b>\n" + "\n".join(
        f"• {escape(a['sensor'])} · <code>{a['sid']}</code> · {escape(a['message'])}" for a in alerts)


def main():
    if len(KEY) < 32:
        sys.exit("Falta ATALAYA_INGEST_KEY (cópiala del .env del backend)")
    log(f"Agente Atalaya en {socket.gethostname()} · backend {BACKEND} · eve {EVE}")
    if TOKEN and CHAT_ID:
        send("🛡️ <b>Atalaya</b>: el agente IDS se inició y está vigilando Suricata y Snort.")
    for fn in (tail_eve, heartbeat, commands_loop, audit_loop):
        threading.Thread(target=fn, daemon=True).start()
    feed_loop()


if __name__ == "__main__":
    main()
