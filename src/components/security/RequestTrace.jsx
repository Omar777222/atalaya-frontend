import { REQUEST_PATH } from '../../constants/security.js';

// El elemento distintivo: el recorrido que hace tu inicio de sesión, punto de control por punto de control
export default function RequestTrace() {
  return (
    <ol className="trace" aria-label="Recorrido de una petición">
      {REQUEST_PATH.map((step, i) => (
        <li key={step.name} className="trace__step" style={{ '--i': i }}>
          <span className="trace__node" aria-hidden="true" />
          <div>
            <p className="trace__name">{step.name}</p>
            <p className="trace__detail">{step.detail}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
