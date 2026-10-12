import { useEffect, useState } from 'react';

// Segundos que faltan para una fecha, actualizados cada segundo
export function useCountdown(targetIso) {
  const calc = () => (targetIso ? Math.max(0, Math.round((new Date(targetIso).getTime() - Date.now()) / 1000)) : 0);
  const [seconds, setSeconds] = useState(calc);

  useEffect(() => {
    setSeconds(calc());
    const id = setInterval(() => setSeconds(calc()), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetIso]);

  return seconds;
}
