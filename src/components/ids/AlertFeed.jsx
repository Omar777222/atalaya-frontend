import SensorBadge from './SensorBadge.jsx';
import { endpoint, timeAgo } from '../../utils/format.js';
import { useNow } from '../../hooks/useNow.js';

// Lista compacta de las alertas más recientes (Centro de monitoreo)
export default function AlertFeed({ alerts, onSelect }) {
  const now = useNow(3000);
  if (!alerts.length) {
    return <p className="empty">Esperando tráfico… Ejecuta la primera prueba de la página Demo en vivo.</p>;
  }
  return (
    <ul className="feed">
      {alerts.map((a) => (
        <li key={a.id} className={`feed__item ${a.isNew ? 'is-new' : ''}`}>
          <button type="button" className="feed__btn" onClick={() => onSelect?.(a)}>
            <SensorBadge sensor={a.sensor} showKind={false} />
            <span className="feed__msg">{a.message}</span>
            <span className="feed__meta mono">{endpoint(a.srcIp, a.srcPort)} → {endpoint(a.dstIp, a.dstPort)}</span>
            <span className="feed__time">{timeAgo(a.timestamp, now)}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
