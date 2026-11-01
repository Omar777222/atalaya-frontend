import Badge from '../ui/Badge.jsx';
import SensorBadge from './SensorBadge.jsx';
import { SERVICE_STATUS, LOG_STATUS } from '../../constants/ids.js';
import { timeAgo, formatNumber } from '../../utils/format.js';
import { useNow } from '../../hooks/useNow.js';

export default function SensorCard({ sensor }) {
  const now = useNow(5000);
  const service = SERVICE_STATUS[sensor.status?.service] ?? SERVICE_STATUS.unknown;
  const log = sensor.status?.log;
  return (
    <section className={`sensor-card sensor-card--${sensor.id}`}>
      <header className="sensor-card__head">
        <div>
          <SensorBadge sensor={sensor.id} />
          <h3 className="sensor-card__title">{sensor.host}</h3>
          <p className="sensor-card__role">{sensor.role}</p>
        </div>
        <Badge tone={service.tone}>{service.label}</Badge>
      </header>

      <p className="sensor-card__count"><strong>{formatNumber(sensor.alertCount)}</strong> alertas</p>
      <p className="sensor-card__last">
        {sensor.lastAlert ? <>Última: <span>{sensor.lastAlert.message}</span> · {timeAgo(sensor.lastAlert.timestamp, now)}</> : 'Aún no hay alertas de este sensor'}
      </p>

      <dl className="sensor-card__facts">
        <div><dt>IP privada</dt><dd className="mono">{sensor.ip}</dd></div>
        <div><dt>HOME_NET</dt><dd className="mono">{sensor.homeNet}</dd></div>
        <div><dt>Interfaz</dt><dd className="mono">{sensor.interface}</dd></div>
        <div><dt>Registro</dt><dd>{log?.status ? (LOG_STATUS[log.status] ?? log.status) : '—'}</dd></div>
        {sensor.id === 'suricata' && (
          <div><dt>Bot de Telegram</dt><dd>{sensor.status?.telegram === 'ok' ? 'Enviando alertas' : sensor.status?.telegram ?? 'Sin datos'}</dd></div>
        )}
        <div><dt>Último latido</dt><dd>{timeAgo(sensor.status?.lastHeartbeatAt, now)}</dd></div>
      </dl>
      {log?.error && <p className="sensor-card__error">Diagnóstico: {log.error} en <span className="mono">{log.path}</span></p>}
    </section>
  );
}
