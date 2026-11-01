import { useNavigate } from 'react-router-dom';
import { useIdsLive } from '../../hooks/useIdsLive.js';
import SensorBadge from './SensorBadge.jsx';
import { endpoint } from '../../utils/format.js';

// Avisos emergentes cuando llega una alerta nueva (muy útil durante la demo)
export default function ToastStack() {
  const { toasts, dismissToast } = useIdsLive();
  const navigate = useNavigate();
  return (
    <div className="toasts" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.toastId} className={`toast toast--${t.sensor}`} role="status">
          <button type="button" className="toast__body" onClick={() => { dismissToast(t.toastId); navigate('/alertas', { state: { select: t.id } }); }}>
            <span className="toast__top">
              <SensorBadge sensor={t.sensor} />
              <span className="toast__label">Nueva alerta{t.count > 1 ? ` ×${t.count}` : ''}</span>
            </span>
            <span className="toast__msg">{t.message}</span>
            <span className="toast__meta mono">SID {t.sid} · {endpoint(t.srcIp, t.srcPort)} → {endpoint(t.dstIp, t.dstPort)}</span>
          </button>
          <button type="button" className="toast__close" onClick={() => dismissToast(t.toastId)} aria-label="Cerrar aviso">×</button>
        </div>
      ))}
    </div>
  );
}
