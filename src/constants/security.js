export const ROLES = { ADMIN: 'admin', ANALYST: 'analyst' };

export const ROLE_LABELS = {
  admin: 'Administración',
  analyst: 'Analista',
};

// Recorrido de una petición por la arquitectura (pantalla de inicio de sesión)
export const REQUEST_PATH = [
  { name: 'Tu navegador', detail: 'Cifra usuario y contraseña con TLS' },
  { name: 'AWS WAF', detail: 'Frena SQL Injection, XSS y exceso de peticiones' },
  { name: 'Balanceador ALB', detail: 'Único punto de entrada público' },
  { name: 'Nginx, UFW y Fail2Ban', detail: 'VPC Frontend 10.0.0.0/17' },
  { name: 'VPC Peering', detail: 'Red privada, nunca pasa por internet' },
  { name: 'API con JWT', detail: 'VPC Backend 10.0.128.0/17, sin internet' },
];

// Capas de defensa en profundidad (pantalla de resumen)
export const DEFENSE_LAYERS = [
  { group: 'Perímetro', name: 'AWS WAF', detail: 'Reglas administradas de AWS, SQLi, XSS y límite de peticiones por IP' },
  { group: 'Perímetro', name: 'Balanceador ALB', detail: 'HTTPS con certificado de Let\'s Encrypt; el servidor no se expone directo' },
  { group: 'Red', name: 'Segmentación', detail: 'Dos VPC unidas por Peering; el backend no tiene salida a internet' },
  { group: 'Red', name: 'Security Groups', detail: 'Cada servidor acepta solo el puerto y el origen que necesita' },
  { group: 'Servidor', name: 'UFW', detail: 'Firewall propio en cada instancia, todo cerrado por defecto' },
  { group: 'Servidor', name: 'Fail2Ban', detail: 'Bloquea por 10 minutos la IP que falla 5 inicios de sesión' },
  { group: 'Aplicación', name: 'Encabezados de seguridad', detail: 'HSTS, CSP, X-Frame-Options, nosniff y Referrer-Policy' },
  { group: 'Aplicación', name: 'JWT y roles', detail: 'Token de 15 minutos verificado y autorizado en cada petición' },
  { group: 'Monitoreo', name: 'CloudWatch y CloudTrail', detail: 'Métricas, registros de WAF y auditoría de la cuenta' },
];

export const EVENT_TYPES = {
  LOGIN_SUCCESS: { label: 'Inicio de sesión', tone: 'ok' },
  LOGIN_FAILURE: { label: 'Intento fallido', tone: 'warn' },
  LOGOUT: { label: 'Cierre de sesión', tone: 'neutral' },
  TOKEN_REJECTED: { label: 'Token rechazado', tone: 'danger' },
  ACCESS_DENIED: { label: 'Acceso denegado', tone: 'danger' },
  INPUT_REJECTED: { label: 'Entrada rechazada', tone: 'warn' },
};
