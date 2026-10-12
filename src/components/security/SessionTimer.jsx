import { useCountdown } from '../../hooks/useCountdown.js';
import { pad } from '../../utils/format.js';

const SESSION_SECONDS = 15 * 60;

export default function SessionTimer({ expiresAt }) {
  const left = useCountdown(expiresAt);
  const pct = Math.min(100, (left / SESSION_SECONDS) * 100);
  const urgent = left <= 120;

  return (
    <div className={`session-timer ${urgent ? 'session-timer--urgent' : ''}`} title="Tiempo restante del token JWT">
      <span className="session-timer__label">Sesión</span>
      <span className="session-timer__value">{pad(Math.floor(left / 60))}:{pad(left % 60)}</span>
      <span className="session-timer__bar" aria-hidden="true">
        <span style={{ width: `${pct}%` }} />
      </span>
    </div>
  );
}
