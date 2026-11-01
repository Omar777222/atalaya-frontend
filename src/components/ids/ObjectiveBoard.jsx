import SensorBadge from './SensorBadge.jsx';
import { timeAgo } from '../../utils/format.js';
import { useNow } from '../../hooks/useNow.js';

// El tablero de las pruebas de la práctica: cada tarjeta se enciende cuando llega su alerta.
export default function ObjectiveBoard({ objectives }) {
  const now = useNow(5000);
  return (
    <ol className="objectives">
      {objectives.map((o) => (
        <li key={o.id} className={`objective ${o.detected ? 'objective--done' : ''}`}>
          <span className="objective__state" aria-hidden="true">
            {o.detected ? (
              <svg viewBox="0 0 24 24"><path d="M5 12.5l4.2 4.2L19 7" /></svg>
            ) : <span>{o.order}</span>}
          </span>
          <div className="objective__body">
            <p className="objective__title">{o.title}</p>
            <p className="objective__summary">{o.summary}</p>
            <div className="objective__sensors">
              {Object.entries(o.detections).map(([sensor, d]) => (
                <span key={sensor} className={`objective__hit ${d.count ? 'objective__hit--on' : ''}`}>
                  <SensorBadge sensor={sensor} showKind={false} />
                  {d.count ? `${d.count} · ${timeAgo(d.lastAt, now)}` : 'pendiente'}
                </span>
              ))}
            </div>
          </div>
          <span className="sr-only">{o.detected ? 'Detectado' : 'Pendiente'}</span>
        </li>
      ))}
    </ol>
  );
}
