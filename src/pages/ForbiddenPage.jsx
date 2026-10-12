import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { ROLE_LABELS } from '../constants/security.js';

export default function ForbiddenPage() {
  const { user } = useAuth();
  return (
    <div className="status-page">
      <svg viewBox="0 0 48 48" className="status-page__icon" aria-hidden="true">
        <rect x="10" y="21" width="28" height="20" rx="4" />
        <path d="M16 21v-5a8 8 0 0 1 16 0v5" />
        <path d="M24 29v5" />
      </svg>
      <h1>Tu rol no tiene acceso a esta sección</h1>
      <p>
        Iniciaste sesión como <strong>{ROLE_LABELS[user.role]}</strong>. Por el principio de mínimo privilegio,
        cada rol solo ve lo que necesita para su trabajo. El servidor también responde 403 si se intenta por la API.
      </p>
      <Link to="/" className="btn btn--primary">Volver al resumen</Link>
    </div>
  );
}
