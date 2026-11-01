import { REQUEST_PATH } from '../../constants/security.js';

// El recorrido del tráfico punto por punto; los dos sensores IDS se resaltan con su color
export default function RequestTrace() {
  return (
    <ol className="trace" aria-label="Recorrido del tráfico y sensores">
      {REQUEST_PATH.map((step, i) => (
        <li key={step.name} className={`trace__step ${step.sensor ? `trace__step--${step.sensor}` : ''}`} style={{ '--i': i }}>
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
