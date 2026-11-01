import { useIdsLive } from '../../hooks/useIdsLive.js';

export default function LiveIndicator() {
  const { status, paused } = useIdsLive();
  const state = paused ? 'paused' : status.connected ? 'live' : 'down';
  const label = { live: 'En vivo', paused: 'En pausa', down: 'Sin conexión' }[state];
  return (
    <span className={`live live--${state}`} title="Las alertas se consultan cada 2.5 s">
      <span className="live__dot" aria-hidden="true" />
      {label}
    </span>
  );
}
