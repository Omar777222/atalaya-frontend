const timeFmt = new Intl.DateTimeFormat('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
const dateTimeFmt = new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
const hourMinFmt = new Intl.DateTimeFormat('es-MX', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });

export const formatTime = (iso) => (iso ? timeFmt.format(new Date(iso)) : '—');
export const formatDateTime = (iso) => (iso ? dateTimeFmt.format(new Date(iso)) : '—');
export const formatHourMin = (iso) => (iso ? hourMinFmt.format(new Date(iso)) : '—');
export const shortId = (id = '') => (id.length > 12 ? `${id.slice(0, 8)}…${id.slice(-4)}` : id);
export const pad = (n) => String(n).padStart(2, '0');
export const formatNumber = (n) => new Intl.NumberFormat('es-MX').format(n ?? 0);

export function timeAgo(iso, now = Date.now()) {
  if (!iso) return 'sin datos';
  const s = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
  if (s < 5) return 'justo ahora';
  if (s < 60) return `hace ${s} s`;
  const m = Math.round(s / 60);
  if (m < 60) return `hace ${m} min`;
  const h = Math.round(m / 60);
  return `hace ${h} h`;
}

export const endpoint = (ip, port) => (ip ? `${ip}${port !== null && port !== undefined && port !== 0 ? `:${port}` : ''}` : '—');
