// Único punto que habla con el backend. Ningún componente usa fetch directamente.
const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

let onUnauthorized = null;
export const setUnauthorizedHandler = (handler) => { onUnauthorized = handler; };

export class ApiError extends Error {
  constructor(message, status, kind = 'api') {
    super(message);
    this.status = status;
    this.kind = kind; // api | network | waf | forbidden | rate
  }
}

export async function request(path, { method = 'GET', body, token, query } = {}) {
  const params = new URLSearchParams();
  Object.entries(query ?? {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') params.set(k, v);
  });
  const url = `${BASE_URL}${path}${params.size ? `?${params}` : ''}`;

  const headers = { Accept: 'application/json' };
  if (body) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
  } catch {
    throw new ApiError('No se pudo conectar con el servidor. Revisa tu conexión o intenta más tarde.', 0, 'network');
  }

  if (response.status === 204) return null;

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    // AWS WAF responde 403 con una página HTML (no JSON) cuando bloquea un ataque
    if (response.status === 403 && !isJson) {
      throw new ApiError('AWS WAF bloqueó esta solicitud porque parece un ataque (SQL Injection, XSS o exceso de peticiones).', 403, 'waf');
    }
    if (response.status === 429) {
      throw new ApiError(data?.error ?? 'Demasiadas solicitudes. Espera un momento e intenta de nuevo.', 429, 'rate');
    }
    if (response.status === 401 && token && onUnauthorized) onUnauthorized(data?.error);
    throw new ApiError(data?.error ?? `El servidor respondió con error ${response.status}`, response.status,
      response.status === 403 ? 'forbidden' : 'api');
  }
  return data;
}
