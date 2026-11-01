import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { idsService } from '../api/idsService.js';

export const IdsLiveContext = createContext(null);

const MAX_ALERTS = 400;
const POLL_MS = 2500;

// Un solo lugar consulta las alertas nuevas (con cursor) y las comparte con todas las páginas.
// Además genera los avisos emergentes cuando llega una alerta durante la demo.
export function IdsLiveProvider({ children }) {
  const { token, user } = useAuth();
  // El cliente del servicio no ve alertas técnicas: no se consulta (evita 403 en la auditoría)
  const enabled = user?.role !== 'client';
  const [alerts, setAlerts] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [status, setStatus] = useState({ connected: false, error: null, lastPollAt: null });
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const cursorRef = useRef(null);
  const mutedRef = useRef(muted);
  mutedRef.current = muted;

  const pushToasts = useCallback((fresh) => {
    if (mutedRef.current || fresh.length === 0) return;
    // Agrupa por sensor + SID para no llenar la pantalla durante un escaneo
    const groups = new Map();
    for (const a of fresh) {
      const key = `${a.sensor}:${a.sid}`;
      const g = groups.get(key) ?? { ...a, count: 0 };
      g.count += 1;
      groups.set(key, g);
    }
    const items = [...groups.values()].slice(0, 3).map((a) => ({ ...a, toastId: `${a.id}-${Date.now()}` }));
    setToasts((t) => [...items, ...t].slice(0, 4));
    for (const item of items) {
      setTimeout(() => setToasts((t) => t.filter((x) => x.toastId !== item.toastId)), 6000);
    }
  }, []);

  const poll = useCallback(async () => {
    if (!token) return;
    try {
      const first = cursorRef.current === null;
      const data = await idsService.alerts(token, first ? { limit: MAX_ALERTS } : { after: cursorRef.current, limit: 200 });
      cursorRef.current = data.cursor;
      if (data.alerts.length) {
        setAlerts((prev) => {
          const known = new Set(prev.map((a) => a.id));
          const fresh = data.alerts.filter((a) => !known.has(a.id));
          if (!first) pushToasts(fresh);
          return [...fresh.map((a) => ({ ...a, isNew: !first })), ...prev.map((a) => ({ ...a, isNew: false }))].slice(0, MAX_ALERTS);
        });
      } else {
        setAlerts((prev) => (prev.some((a) => a.isNew) ? prev.map((a) => ({ ...a, isNew: false })) : prev));
      }
      setStatus({ connected: true, error: null, lastPollAt: new Date() });
    } catch (error) {
      setStatus((s) => ({ ...s, connected: false, error }));
    }
  }, [token, pushToasts]);

  useEffect(() => {
    if (paused || !enabled) return undefined;
    let timer;
    let cancelled = false;
    const tick = async () => {
      if (!document.hidden) await poll();
      if (!cancelled) timer = setTimeout(tick, POLL_MS);
    };
    tick();
    return () => { cancelled = true; clearTimeout(timer); };
  }, [poll, paused, enabled]);

  const clearLocal = useCallback(() => setAlerts([]), []);
  const dismissToast = useCallback((id) => setToasts((t) => t.filter((x) => x.toastId !== id)), []);

  const value = useMemo(() => ({
    alerts, toasts, status, paused, muted,
    setPaused, setMuted, clearLocal, dismissToast, refresh: poll,
  }), [alerts, toasts, status, paused, muted, clearLocal, dismissToast, poll]);

  return <IdsLiveContext.Provider value={value}>{children}</IdsLiveContext.Provider>;
}
