import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { authService } from '../api/authService.js';
import { setUnauthorizedHandler } from '../api/httpClient.js';

export const AuthContext = createContext(null);
const STORAGE_KEY = 'atalaya_session';

const readStored = () => {
  try {
    const s = JSON.parse(sessionStorage.getItem(STORAGE_KEY));
    return s?.token && new Date(s.expiresAt).getTime() > Date.now() ? s : null;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [status, setStatus] = useState('checking'); // checking | ready
  const [notice, setNotice] = useState('');

  const clearSession = useCallback((message = '') => {
    sessionStorage.removeItem(STORAGE_KEY);
    setSession(null);
    setNotice(message);
  }, []);

  // Al abrir la página, el servidor confirma que la sesión guardada sigue siendo válida
  useEffect(() => {
    const stored = readStored();
    if (!stored) {
      sessionStorage.removeItem(STORAGE_KEY);
      setStatus('ready');
      return;
    }
    authService.me(stored.token)
      .then(({ user }) => setSession({ ...stored, user }))
      .catch(() => clearSession('Tu sesión anterior ya no es válida. Inicia sesión de nuevo.'))
      .finally(() => setStatus('ready'));
  }, [clearSession]);

  // Cualquier 401 del backend cierra la sesión en la interfaz
  useEffect(() => {
    setUnauthorizedHandler((msg) => clearSession(msg ?? 'Tu sesión ya no es válida.'));
    return () => setUnauthorizedHandler(null);
  }, [clearSession]);

  // Cierre automático cuando el token expira
  useEffect(() => {
    if (!session) return undefined;
    const ms = new Date(session.expiresAt).getTime() - Date.now();
    const timer = setTimeout(() => clearSession('Tu sesión expiró después de 15 minutos. Inicia sesión de nuevo.'), Math.max(ms, 0));
    return () => clearTimeout(timer);
  }, [session, clearSession]);

  const login = useCallback(async (username, password) => {
    const data = await authService.login(username, password);
    const next = { token: data.token, expiresAt: data.expiresAt, user: data.user };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setNotice('');
    setSession(next);
  }, []);

  const logout = useCallback(async () => {
    const token = session?.token;
    clearSession('Cerraste sesión. El servidor invalidó tu token.');
    if (token) await authService.logout(token).catch(() => {});
  }, [session, clearSession]);

  const value = useMemo(() => ({
    status,
    notice,
    token: session?.token ?? null,
    user: session?.user ?? null,
    expiresAt: session?.expiresAt ?? null,
    isAuthenticated: Boolean(session),
    login,
    logout,
  }), [status, notice, session, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
