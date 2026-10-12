const timeFmt = new Intl.DateTimeFormat('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
const dateTimeFmt = new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

export const formatTime = (iso) => (iso ? timeFmt.format(new Date(iso)) : '—');
export const formatDateTime = (iso) => (iso ? dateTimeFmt.format(new Date(iso)) : '—');
export const shortId = (id = '') => (id.length > 12 ? `${id.slice(0, 8)}…${id.slice(-4)}` : id);
export const pad = (n) => String(n).padStart(2, '0');
