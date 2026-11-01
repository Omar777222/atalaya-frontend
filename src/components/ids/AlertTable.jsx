import Badge from '../ui/Badge.jsx';
import SensorBadge from './SensorBadge.jsx';
import { PRIORITY } from '../../constants/ids.js';
import { endpoint, formatTime } from '../../utils/format.js';

export default function AlertTable({ alerts, selectedId, onSelect }) {
  return (
    <div className="table-wrap">
      <table className="table table--alerts">
        <thead>
          <tr>
            <th scope="col">Hora</th>
            <th scope="col">Sensor</th>
            <th scope="col">Alerta</th>
            <th scope="col">Origen → destino</th>
            <th scope="col">Prioridad</th>
          </tr>
        </thead>
        <tbody>
          {alerts.map((a) => {
            const p = PRIORITY[a.priority];
            return (
              <tr
                key={a.id}
                className={`${a.isNew ? 'is-new' : ''} ${selectedId === a.id ? 'is-selected' : ''}`}
                onClick={() => onSelect(a)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(a); } }}
                tabIndex={0}
                aria-selected={selectedId === a.id}
              >
                <td className="nowrap mono">{formatTime(a.timestamp)}</td>
                <td><SensorBadge sensor={a.sensor} showKind={false} /></td>
                <td className="table__alert">
                  <span className="table__primary">{a.message}</span>
                  <span className="table__secondary mono">SID {a.sid} · {a.protocol ?? '—'}</span>
                </td>
                <td className="mono table__flow">
                  <span>{endpoint(a.srcIp, a.srcPort)}</span>
                  <span>→ {endpoint(a.dstIp, a.dstPort)}</span>
                </td>
                <td>{p ? <Badge tone={p.tone}>{p.label}</Badge> : '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
