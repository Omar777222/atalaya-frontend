import { SENSOR_META } from '../../constants/ids.js';

export default function SensorBadge({ sensor, showKind = true }) {
  const meta = SENSOR_META[sensor] ?? { label: sensor, kind: '' };
  return (
    <span className={`sensor-badge sensor-badge--${sensor}`}>
      <span className="sensor-badge__dot" aria-hidden="true" />
      {meta.label}{showKind && meta.kind ? <small>{meta.kind}</small> : null}
    </span>
  );
}
