import { formatHourMin } from '../../utils/format.js';

// Barras apiladas por minuto (Suricata abajo, Snort arriba). Sin librerías.
export default function AlertTimeline({ timeline }) {
  const max = Math.max(1, ...timeline.map((b) => b.snort + b.suricata));
  const total = timeline.reduce((n, b) => n + b.snort + b.suricata, 0);
  return (
    <figure className="timeline">
      <div className="timeline__chart" role="img" aria-label={`${total} alertas en los últimos ${timeline.length} minutos`}>
        <span className="timeline__max">{max}</span>
        {timeline.map((b) => (
          <div key={b.minute} className="timeline__col" title={`${formatHourMin(b.minute)} · Suricata ${b.suricata} · Snort ${b.snort}`}>
            <span className="timeline__bar timeline__bar--snort" style={{ height: `${(b.snort / max) * 100}%` }} />
            <span className="timeline__bar timeline__bar--suricata" style={{ height: `${(b.suricata / max) * 100}%` }} />
          </div>
        ))}
      </div>
      <figcaption className="timeline__axis">
        <span>{formatHourMin(timeline[0]?.minute)}</span>
        <span className="timeline__legend">
          <i className="timeline__key timeline__key--suricata" /> Suricata
          <i className="timeline__key timeline__key--snort" /> Snort
        </span>
        <span>ahora</span>
      </figcaption>
    </figure>
  );
}
