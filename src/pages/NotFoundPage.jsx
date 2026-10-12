import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="status-page">
      <h1>Esta página no existe</h1>
      <p>Revisa la dirección o vuelve al resumen.</p>
      <Link to="/" className="btn btn--primary">Ir al resumen</Link>
    </div>
  );
}
