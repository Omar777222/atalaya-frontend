import { useCallback, useEffect, useRef, useState } from 'react';

// Igual que useApiResource, pero vuelve a consultar cada `intervalMs`
// (se pausa si la pestaña está oculta para no gastar peticiones).
export function usePolling(loader, { intervalMs = 4000, deps = [], enabled = true } = {}) {
  const [state, setState] = useState({ data: null, error: null, loading: true, updatedAt: null });
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  const run = useCallback(async () => {
    try {
      const data = await loaderRef.current();
      setState({ data, error: null, loading: false, updatedAt: new Date() });
    } catch (error) {
      setState((s) => ({ ...s, error, loading: false }));
    }
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;
    let timer;
    let cancelled = false;
    const tick = async () => {
      if (!document.hidden) await run();
      if (!cancelled) timer = setTimeout(tick, intervalMs);
    };
    tick();
    return () => { cancelled = true; clearTimeout(timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run, intervalMs, enabled, ...deps]);

  return { ...state, reload: run };
}
