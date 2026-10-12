import { EVENT_TYPES } from '../../constants/security.js';

export default function ActivitySummary({ activity }) {
  const entries = Object.entries(EVENT_TYPES).map(([type, meta]) => ({ type, ...meta, count: activity?.[type] ?? 0 }));
  const max = Math.max(1, ...entries.map((e) => e.count));

  return (
    <dl className="activity">
      {entries.map((e) => (
        <div key={e.type} className="activity__row">
          <dt>{e.label}</dt>
          <dd>
            <span className={`activity__bar activity__bar--${e.tone}`} aria-hidden="true">
              <span style={{ width: `${(e.count / max) * 100}%` }} />
            </span>
            <span className="activity__count">{e.count}</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}
