import { useCallback, useEffect, useState } from 'react';

// Carga datos de la API y expone estado de carga, error y una función para recargar
export function useApiResource(loader, deps = []) {
  const [state, setState] = useState({ data: null, error: null, loading: true });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const load = useCallback(loader, deps);

  const reload = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await load();
      setState({ data, error: null, loading: false });
    } catch (error) {
      setState((s) => ({ ...s, error, loading: false }));
    }
  }, [load]);

  useEffect(() => { reload(); }, [reload]);

  return { ...state, reload };
}
