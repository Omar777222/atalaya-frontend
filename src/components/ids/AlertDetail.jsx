import Badge from '../ui/Badge.jsx';
import CopyButton from '../ui/CopyButton.jsx';
import SensorBadge from './SensorBadge.jsx';
import { PRIORITY, SENSOR_META } from '../../constants/ids.js';
import { endpoint, formatDateTime } from '../../utils/format.js';

// Ficha de una alerta con el análisis que pide la práctica:
// qué tráfico la provocó, qué regla la generó y por qué era esperable.
export default function AlertDetail({ alert, onClose }) {
  if (!alert) {
    return (
      <aside className="detail detail--empty">
        <p>Selecciona una alerta para ver qué tráfico la provocó, qué regla la generó y por qué era esperable.</p>
      </aside>
    );
  }
  const p = PRIORITY[alert.priority];
  const meta = SENSOR_META[alert.sensor];
  return (
    <aside className={`detail detail--${alert.sensor}`} aria-label="Detalle de la alerta">
      <header className="detail__head">
        <SensorBadge sensor={alert.sensor} />
        {onClose && <button type="button" className="detail__close" onClick={onClose} aria-label="Cerrar detalle">×</button>}
      </header>
      <h2 className="detail__title">{alert.message}</h2>
      <div className="detail__badges">
        <Badge tone="neutral">SID {alert.sid} · rev {alert.rev}</Badge>
        {alert.protocol && <Badge tone="info">{alert.protocol}</Badge>}
        {p && <Badge tone={p.tone}>Prioridad {p.label.toLowerCase()}</Badge>}
        {!alert.localRule && <Badge tone="warn">Regla de terceros</Badge>}
      </div>

      <dl className="facts">
        <div><dt>Fecha</dt><dd>{formatDateTime(alert.timestamp)}</dd></div>
        <div><dt>Origen</dt><dd className="mono">{endpoint(alert.srcIp, alert.srcPort)}</dd></div>
        <div><dt>Destino</dt><dd className="mono">{endpoint(alert.dstIp, alert.dstPort)}</dd></div>
        <div><dt>Sensor</dt><dd>{meta?.label} en {meta?.host}</dd></div>
        {alert.classification && <div><dt>Clasificación</dt><dd>{alert.classification}</dd></div>}
        {alert.extra?.url && <div><dt>URL</dt><dd className="mono">{alert.extra.method} {alert.extra.url}</dd></div>}
        {alert.extra?.userAgent && <div><dt>User-Agent</dt><dd className="mono">{alert.extra.userAgent}</dd></div>}
      </dl>

      {alert.rule ? (
        <>
          <section className="detail__section">
            <h3>¿Qué tráfico la provocó?</h3>
            <p>{alert.rule.trigger}</p>
          </section>
          <section className="detail__section">
            <h3>¿Qué regla la generó?</h3>
            <p className="detail__file mono">{alert.rule.file}</p>
            <pre className="rule-text">{alert.rule.text}</pre>
          </section>
          <section className="detail__section">
            <h3>¿Por qué era esperable?</h3>
            <p>{alert.rule.reason}</p>
          </section>
        </>
      ) : (
        <p className="detail__section">Esta alerta viene de un conjunto de reglas de terceros, no de nuestras reglas locales.</p>
      )}

      <section className="detail__section">
        <div className="detail__raw-head">
          <h3>Registro original</h3>
          <CopyButton text={alert.raw} />
        </div>
        <pre className="rule-text rule-text--raw">{alert.raw}</pre>
      </section>
    </aside>
  );
}
