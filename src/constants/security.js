export const ROLES = { ADMIN: 'admin', ANALYST: 'analyst', CLIENT: 'client' };
export const STAFF = [ROLES.ADMIN, ROLES.ANALYST];

export const ROLE_LABELS = {
  admin: 'Administración',
  analyst: 'Analista',
  client: 'Cliente del servicio',
};

// Recorrido del tráfico y dónde lo observa cada sensor (pantalla de inicio de sesión)
export const REQUEST_PATH = [
  { name: 'Internet / atacante', detail: 'Tu navegador o la VM de Kali Linux' },
  { name: 'AWS WAF y balanceador ALB', detail: 'Filtran SQLi, XSS y exceso de peticiones; terminan TLS' },
  { name: 'Suricata · NIDS', detail: 'Vigila la red de ec2-frontend (10.0.0.0/17)', sensor: 'suricata' },
  { name: 'Nginx, UFW y Fail2Ban', detail: 'Sirve el sitio y reenvía /api por el peering' },
  { name: 'Snort · HIDS', detail: 'Vigila la interfaz de ec2-backend (10.0.128.0/17)', sensor: 'snort' },
  { name: 'API con JWT y alertas a Telegram', detail: 'Cada alerta llega al panel y al grupo del equipo' },
];

// Capas de defensa en profundidad (pantalla de sensores)
export const DEFENSE_LAYERS = [
  { group: 'Perímetro', name: 'AWS WAF', detail: 'Reglas administradas: SQLi, XSS, reputación de IP y límite de peticiones' },
  { group: 'Perímetro', name: 'Balanceador ALB', detail: 'Único punto de entrada; termina TLS con el certificado del dominio' },
  { group: 'Red', name: 'Segmentación', detail: 'Dos VPC unidas por peering; el backend no tiene salida a internet' },
  { group: 'Red', name: 'Security Groups', detail: 'Cada servidor acepta solo el puerto y el origen que necesita' },
  { group: 'Servidor', name: 'UFW y Fail2Ban', detail: 'Firewall por instancia y bloqueo por intentos fallidos' },
  { group: 'Detección', name: 'Suricata (NIDS)', detail: 'Inspecciona el tráfico que llega a ec2-frontend' },
  { group: 'Detección', name: 'Snort (HIDS)', detail: 'Inspecciona el tráfico que llega a ec2-backend' },
  { group: 'Respuesta', name: 'Telegram', detail: 'El equipo recibe cada alerta en segundos' },
  { group: 'Respuesta', name: 'Auditoría', detail: 'Inicios de sesión, tokens rechazados y accesos denegados' },
];

export const EVENT_TYPES = {
  LOGIN_SUCCESS: { label: 'Inicio de sesión', tone: 'ok' },
  LOGIN_FAILURE: { label: 'Intento fallido', tone: 'warn' },
  LOGOUT: { label: 'Cierre de sesión', tone: 'neutral' },
  TOKEN_REJECTED: { label: 'Token rechazado', tone: 'danger' },
  ACCESS_DENIED: { label: 'Acceso denegado', tone: 'danger' },
  INPUT_REJECTED: { label: 'Entrada rechazada', tone: 'warn' },
  SERVICE_KEY_REJECTED: { label: 'Clave de agente rechazada', tone: 'danger' },
  IDS_RESET: { label: 'Panel IDS reiniciado', tone: 'info' },
};
