import Badge from '../ui/Badge.jsx';
import { EVENT_TYPES } from '../../constants/security.js';
import { formatDateTime } from '../../utils/format.js';

export default function AuditTable({ events }) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th scope="col">Fecha</th>
            <th scope="col">Evento</th>
            <th scope="col">Usuario</th>
            <th scope="col">IP de origen</th>
            <th scope="col">Ruta</th>
            <th scope="col">Detalle</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e) => (
            <tr key={e.id}>
              <td className="nowrap">{formatDateTime(e.timestamp)}</td>
              <td><Badge tone={EVENT_TYPES[e.type]?.tone}>{EVENT_TYPES[e.type]?.label ?? e.type}</Badge></td>
              <td>{e.username ?? '—'}</td>
              <td className="mono">{e.ip ?? '—'}</td>
              <td className="mono">{e.path ?? '—'}</td>
              <td className="table__detail">{e.detail}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
