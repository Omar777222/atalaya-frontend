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
    id: 'suricata',
    title: 'Fase A · Suricata vigila el frontend',
    lead: 'El atacante (Kali) apunta directo a la IP pública de ec2-frontend. Requiere la excepción temporal en frontend-sg para la IP de Kali.',
    steps: [
      {
        id: 'a1', objective: 'icmp', where: 'Kali Linux', title: 'Ping al frontend',
        commands: ['ping -c 4 {FRONT}'],
        expect: [{ sensor: 'suricata', sid: 1100001 }],
        observe: 'Una alerta por cada echo request. En Telegram llega la primera y las siguientes se agrupan.',
      },
      {
        id: 'a2', objective: 'sniffer', where: 'Kali Linux', title: 'Credenciales en texto claro + Wireshark',
        commands: [
          'sudo wireshark &   # captura en eth0 de Kali con el filtro: host {FRONT}',
          'curl -s -o /dev/null -X POST http://{FRONT}/api/auth/login -H "Content-Type: application/json" -d \'{"username":"admin","password":"Prueba-Sniffer123"}\'',
        ],
        expect: [{ sensor: 'suricata', sid: 1100101 }],
        observe: 'En Wireshark: filtro http.request.method == "POST" y Follow → TCP Stream muestra la contraseña. Suricata alerta lo mismo.',
      },
      {
        id: 'a3', objective: 'nmap', where: 'Kali Linux', title: 'Reconocimiento con Nmap',
        commands: ['sudo nmap -sS -p 1-1000 {FRONT}', 'sudo nmap -sV -sC -p 80 {FRONT}'],
        expect: [{ sensor: 'suricata', sid: 1100002 }, { sensor: 'suricata', sid: 1100003 }],
        observe: 'El escaneo SYN dispara el umbral (20 SYN en 5 s) y los scripts NSE se delatan por su User-Agent.',
      },
      {
        id: 'a4', objective: 'web', where: 'Kali Linux', title: 'Inyección SQL con sqlmap',
        commands: ['sqlmap -u "http://{FRONT}/api/health?check=1" --batch --ignore-redirects --level=1'],
        expect: [{ sensor: 'suricata', sid: 1100201 }, { sensor: 'suricata', sid: 1100202 }, { sensor: 'suricata', sid: 1100204 }],
        observe: 'Repite con --random-agent: la alerta del User-Agent (1100201) desaparece, pero las de contenido siguen.',
      },
    ],
  },
  {
    id: 'snort',
    title: 'Fase B · Snort vigila el backend',
    lead: 'Escenario de movimiento lateral: el atacante ya está dentro de ec2-frontend y desde ahí ataca la IP privada del backend.',
    steps: [
      {
        id: 'b0', objective: null, where: 'Kali Linux', title: 'Entrar al frontend (pivote)',
        commands: ['ssh -i llave.pem ubuntu@{FRONT}'],
        expect: [],
        observe: 'Las siguientes pruebas se ejecutan dentro de ec2-frontend.',
      },
      {
        id: 'b1', objective: 'icmp', where: 'ec2-frontend', title: 'Ping al backend por el peering',
        commands: ['ping -c 4 {BACK}'],
        expect: [{ sensor: 'snort', sid: 1000001 }],
        observe: 'Es la prueba que pide el documento: la regla de local.rules alerta cada echo request.',
      },
      {
        id: 'b2', objective: 'sniffer', where: 'Navegador + ec2-backend', title: 'El login viaja en claro por dentro',
        commands: [
          'sudo tcpdump -i eth0 -w /tmp/backend-login.pcap port 3000   # en ec2-backend (Ctrl+C al terminar)',
          'Inicia sesión en https://{DOMAIN} desde el navegador',
        ],
        expect: [{ sensor: 'snort', sid: 1000003 }, { sensor: 'suricata', sid: 1100102 }],
        observe: 'Aunque el usuario ve HTTPS, el tramo Nginx → API va por HTTP: lo detectan los dos sensores y Wireshark lo puede leer en el .pcap.',
      },
      {
        id: 'b3', objective: 'nmap', where: 'ec2-frontend', title: 'Nmap hacia el backend',
        commands: ['sudo nmap -sS -p 1-1000 {BACK}'],
        expect: [{ sensor: 'snort', sid: 1000002 }],
        observe: 'Requiere la excepción temporal "todo TCP desde 10.0.0.10" en backend-sg; sin ella los SYN no llegan a la interfaz.',
      },
      {
        id: 'b4', objective: 'web', where: 'ec2-frontend', title: 'Fuerza bruta al login de la API',
        commands: ['for i in $(seq 1 7); do curl -s -o /dev/null -w "%{http_code}\\n" -X POST http://{BACK}:3000/api/auth/login -H "Content-Type: application/json" -d \'{"username":"admin","password":"intento\'$i\'"}\'; done'],
        expect: [{ sensor: 'snort', sid: 1000004 }],
        observe: 'detection_filter deja pasar 5 intentos y alerta desde el sexto. En Auditoría aparecen los "Intento fallido". Va directo a la API, así que Fail2Ban (que vigila Nginx) no bloquea a nadie.',
      },
      {
        id: 'b5', objective: 'web', where: 'Kali Linux', title: 'sqlmap por túnel SSH hacia la API',
        commands: ['ssh -i llave.pem -N -L 3000:{BACK}:3000 ubuntu@{FRONT} &', 'sqlmap -u "http://127.0.0.1:3000/api/health?check=1" --batch --level=1'],
        expect: [{ sensor: 'snort', sid: 1000005 }, { sensor: 'snort', sid: 1000006 }],
        observe: 'El túnel saca el tráfico desde ec2-frontend hacia el backend, como lo haría un atacante con acceso al servidor.',
      },
    ],
  },
];

// Lo que hay que preparar antes de la demo (excepciones temporales de laboratorio)
export const DEMO_CHECKLIST = [
  'frontend-sg: agregar temporalmente ICMP, TCP 1-1000 y HTTP 80 desde la IP pública de Kali (/32).',
  'frontend-sg (salida): agregar temporalmente "todo TCP" hacia 10.0.128.10/32 para el Nmap del pivote.',
  'backend-sg: agregar temporalmente "todo TCP" desde 10.0.0.10/32 (sin esto Snort no ve el escaneo).',
  'Fail2Ban: agregar la IP de Kali en ignoreip del jail nginx-atalaya-login para que no los bloquee a media demo.',
  'Pulsar "Reiniciar contadores" en el Centro de monitoreo y abrir el grupo de Telegram en el teléfono.',
  'Al terminar: borrar las excepciones de los Security Groups y quitar la IP de ignoreip.',
];
