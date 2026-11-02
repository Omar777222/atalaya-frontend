// Datos de presentación del centro de monitoreo IDS.
export const SENSOR_META = {
  suricata: { label: 'Suricata', kind: 'NIDS', host: 'ec2-frontend', tone: 'suricata' },
  snort: { label: 'Snort', kind: 'HIDS', host: 'ec2-backend', tone: 'snort' },
};

export const SERVICE_STATUS = {
  active: { label: 'Activo', tone: 'ok' },
  activating: { label: 'Iniciando', tone: 'warn' },
  inactive: { label: 'Detenido', tone: 'danger' },
  failed: { label: 'Falló', tone: 'danger' },
  stale: { label: 'Sin latido reciente', tone: 'warn' },
  'no-heartbeat': { label: 'Esperando al agente', tone: 'neutral' },
  unavailable: { label: 'Sin systemd (local)', tone: 'neutral' },
  offline: { label: 'Sin systemd (local)', tone: 'neutral' },
  unknown: { label: 'Desconocido', tone: 'neutral' },
};

export const LOG_STATUS = {
  ok: 'Leyendo alertas',
  missing: 'El archivo aún no existe',
  forbidden: 'Sin permiso de lectura',
  error: 'Error al leer',
  starting: 'Iniciando lectura',
};

export const PRIORITY = {
  1: { label: 'Alta', tone: 'danger' },
  2: { label: 'Media', tone: 'warn' },
  3: { label: 'Baja', tone: 'info' },
  4: { label: 'Informativa', tone: 'neutral' },
};

// Qué significa cada parte de una regla (sección "Anatomía de una regla")
export const RULE_PARTS = {
  action: { label: 'Acción', detail: 'Qué hace el motor si la regla coincide. "alert" registra la alerta sin bloquear (IDS pasivo).' },
  protocol: { label: 'Protocolo', detail: 'Tipo de tráfico que se revisa: icmp, tcp, udp o, en Suricata, protocolos de aplicación como http.' },
  source: { label: 'Origen', detail: 'Dirección y puerto de quien envía. "any" acepta cualquier origen.' },
  direction: { label: 'Dirección', detail: '"->" indica el sentido del tráfico: de origen a destino.' },
  destination: { label: 'Destino', detail: 'A quién va dirigido. $HOME_NET es la red protegida definida en la configuración.' },
  options: { label: 'Opciones', detail: 'Condiciones de detección y metadatos, separados por punto y coma.' },
};

export const OPTION_HELP = {
  msg: 'Texto que aparece en la alerta.',
  sid: 'Identificador único de la regla. Las reglas locales usan 1 000 000 o más.',
  rev: 'Versión de la regla; se incrementa cada vez que se modifica.',
  classtype: 'Categoría del ataque; define la prioridad por defecto.',
  itype: 'Tipo ICMP: 8 es echo request (el ping de salida).',
  flags: 'Banderas TCP que deben estar activas. S = SYN.',
  threshold: 'Limita cuántas alertas se generan: cuenta eventos por origen en una ventana de tiempo.',
  detection_filter: 'La regla solo alerta después de N coincidencias del mismo origen en el tiempo indicado.',
  flow: 'Dirección y estado de la sesión TCP (hacia el servidor y ya establecida).',
  content: 'Texto o bytes que deben aparecer en el paquete.',
  nocase: 'El content anterior no distingue mayúsculas y minúsculas.',
  depth: 'Busca el content solo en los primeros N bytes.',
  within: 'El content debe aparecer a menos de N bytes del anterior.',
  distance: 'El content debe aparecer después del anterior.',
  pcre: 'Expresión regular compatible con Perl.',
  'http.method': 'Buffer de Suricata con el método HTTP (GET, POST…).',
  'http.request_body': 'Buffer de Suricata con el cuerpo de la petición.',
  'http.uri': 'Buffer de Suricata con la URI normalizada.',
  'http.user_agent': 'Buffer de Suricata con el encabezado User-Agent.',
};

// Guion de la demostración: quién ejecuta, qué comando y qué alerta debe aparecer.
// {FRONT} = IP pública de ec2-frontend · {BACK} = IP privada de ec2-backend · {DOMAIN} = dominio
export const DEMO_PHASES = [
  {
    id: 'snort',
    title: 'Fase A · Snort vigila el backend (práctica 2.5)',
    lead: 'Sensor: ec2-backend (10.0.128.10). Host de prueba: ec2-frontend (10.0.0.10), por el peering. Requiere la excepción "todo TCP desde 10.0.0.10" en backend-sg.',
    steps: [
      {
        id: 'a0', objective: null, where: 'Kali Linux', title: 'Entrar a los servidores',
        commands: ['ssh -i llave.pem ubuntu@{FRONT}   # host de prueba', 'ssh -i llave.pem -J ubuntu@{FRONT} ubuntu@{BACK}   # sensor (otra terminal)'],
        expect: [],
        observe: 'Deja en el sensor: sudo tail -f /var/log/snort/alert_fast.txt',
      },
      {
        id: 'a1', objective: 'icmp', where: 'ec2-frontend', title: 'Alerta 1 · ICMP',
        commands: ['ping -c 4 {BACK}'],
        expect: [{ sensor: 'snort', sid: 1000001 }],
        observe: 'Una alerta por cada echo request hacia HOME_NET (10.0.128.0/24).',
      },
      {
        id: 'a2', objective: 'sniffer', where: 'ec2-backend + ec2-frontend', title: 'Alerta 2 · Sniffer (tshark con resolución de nombres)',
        commands: [
          'sudo tshark -i eth0 -n -c 30      # en el backend · control: SIN resolución, NO debe alertar',
          'sudo tshark -i eth0 -N nN -c 30   # en el backend · CON resolución: debe alertar',
          'ping -c 10 {BACK}                 # en el frontend, mientras tshark captura',
        ],
        expect: [{ sensor: 'snort', sid: 1000002 }],
        observe: 'Con -N nN Wireshark/tshark pregunta al DNS de la VPC el nombre de cada IP (consultas PTR): eso es lo que detecta Snort.',
      },
      {
        id: 'a3', objective: 'nmap', where: 'ec2-frontend', title: 'Alerta 3 · Escaneo con Nmap',
        commands: ['sudo nmap -sS -p 1-200 {BACK}'],
        expect: [{ sensor: 'snort', sid: 1000003 }],
        observe: 'Sin la excepción en backend-sg los SYN se descartan antes de llegar a la interfaz y Snort no los ve.',
      },
      {
        id: 'a4', objective: 'sniffer', where: 'Navegador + ec2-backend', title: 'Ampliación · El login viaja en claro por dentro',
        commands: [
          'sudo tcpdump -i eth0 -w /tmp/backend-login.pcap port 3000   # en el backend (Ctrl+C al terminar)',
          'Inicia sesión en https://{DOMAIN} desde el navegador',
        ],
        expect: [{ sensor: 'snort', sid: 1000004 }, { sensor: 'suricata', sid: 1000102 }],
        observe: 'El usuario ve HTTPS, pero el tramo Nginx → API va por HTTP: lo detectan los dos sensores y Wireshark lo lee en el .pcap.',
      },
      {
        id: 'a5', objective: 'web', where: 'ec2-frontend', title: 'Ampliación · Fuerza bruta a la API',
        commands: ['for i in $(seq 1 7); do curl -s -o /dev/null -w "%{http_code}\\n" -X POST http://{BACK}:3000/api/auth/login -H "Content-Type: application/json" -d \'{"username":"admin","password":"intento\'$i\'"}\'; done'],
        expect: [{ sensor: 'snort', sid: 1000005 }],
        observe: 'detection_filter alerta desde el sexto intento. En Auditoría y Telegram aparecen los "Intento fallido".',
      },
    ],
  },
  {
    id: 'suricata',
    title: 'Fase B · Suricata vigila el frontend (práctica 2.6)',
    lead: 'Sensor: ec2-frontend. Atacante: Kali, contra la IP pública del frontend. Requiere la excepción temporal en frontend-sg para la IP de Kali.',
    steps: [
      {
        id: 'b0', objective: null, where: 'ec2-frontend', title: 'Ver las alertas en vivo',
        commands: ['sudo tail -f /var/log/suricata/fast.log'],
        expect: [],
        observe: 'Deja esta terminal abierta durante toda la fase.',
      },
      {
        id: 'b1', objective: 'nmap', where: 'Kali Linux', title: 'Sensor 1 · Nmap',
        commands: ['ping -c 10 {FRONT}', 'sudo nmap -sS -p 1-1000 {FRONT}', 'sudo nmap -sV -sC -p 80 {FRONT}'],
        expect: [{ sensor: 'suricata', sid: 1000002 }, { sensor: 'suricata', sid: 1000001 }, { sensor: 'suricata', sid: 1000003 }],
        observe: 'Barrido ICMP (5 pings en 5 s), escaneo SYN (20 SYN en 5 s) y scripts NSE delatados por su User-Agent.',
      },
      {
        id: 'b2', objective: 'sniffer', where: 'Kali + ec2-frontend', title: 'Sensor 2 · Wireshark (credenciales en claro)',
        commands: [
          'sudo tcpdump -i ens5 -w /tmp/lab.pcap host IP_KALI   # en el frontend',
          'curl -s -o /dev/null -X POST http://{FRONT}/api/auth/login -H "Content-Type: application/json" -d \'{"username":"admin","password":"Secreto123"}\'   # en Kali',
          'sudo suricata -c /etc/suricata/suricata.yaml -r /tmp/lab.pcap -l /tmp/pcap-out && cat /tmp/pcap-out/fast.log   # validación offline',
        ],
        expect: [{ sensor: 'suricata', sid: 1000100 }],
        observe: 'Descarga lab.pcap con scp, ábrelo en Wireshark: http.request.method == "POST" → Follow TCP Stream muestra la contraseña.',
      },
      {
        id: 'b3', objective: 'web', where: 'Kali Linux', title: 'Sensor 3 · SQLMap',
        commands: [
          'sqlmap -u "http://{FRONT}/api/health?check=1" --batch --ignore-redirects --level=1',
          'sqlmap -u "http://{FRONT}/api/health?check=1" --batch --ignore-redirects --level=1 --random-agent',
        ],
        expect: [{ sensor: 'suricata', sid: 1000200 }, { sensor: 'suricata', sid: 1000201 }, { sensor: 'suricata', sid: 1000203 }],
        observe: 'Con --random-agent deja de aparecer 1000200 (User-Agent), pero las de contenido (1000201-1000203) siguen.',
      },
    ],
  },
];

// Lo que hay que preparar antes de la demo (excepciones temporales de laboratorio)
export const DEMO_CHECKLIST = [
  'frontend-sg: agregar temporalmente ICMP, TCP 1-1000 y HTTP 80 desde la IP pública de Kali (/32).',
  'frontend-sg (salida): agregar temporalmente "todo TCP" hacia 10.0.128.10/32 para el Nmap del pivote.',
  'backend-sg: agregar temporalmente "todo TCP" desde 10.0.0.10/32 (sin esto Snort no ve el escaneo).',
  'backend-sg (salida) y frontend-sg: deben permitir DNS (UDP 53) hacia la VPC para la prueba de tshark (lo permiten por defecto).',
  'Fail2Ban: agregar la IP de Kali en ignoreip del jail nginx-atalaya-login para que no los bloquee a media demo.',
  'Pulsar "Reiniciar contadores" en el Centro de monitoreo y abrir el grupo de Telegram en el teléfono.',
  'Al terminar: borrar las excepciones de los Security Groups y quitar la IP de ignoreip.',
];
