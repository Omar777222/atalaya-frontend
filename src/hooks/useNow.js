import { useEffect, useState } from 'react';

// Fecha actual que se refresca cada `ms`: sirve para textos como "hace 12 s".
export function useNow(ms = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}
