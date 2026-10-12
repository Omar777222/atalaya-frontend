function StatusIcon({ passed }) {
  return passed ? (
    <svg viewBox="0 0 20 20" className="check__icon check__icon--ok" aria-hidden="true">
      <circle cx="10" cy="10" r="9" />
      <path d="M6 10.5l2.6 2.5L14 7.5" />
    </svg>
  ) : (
    <svg viewBox="0 0 20 20" className="check__icon check__icon--off" aria-hidden="true">
      <circle cx="10" cy="10" r="9" />
      <path d="M10 5.5v5.5M10 14v.5" />
    </svg>
  );
}

export default function CheckList({ checks }) {
  return (
    <ul className="checks">
      {checks.map((c) => (
        <li key={c.id} className={`check ${c.passed ? '' : 'check--off'}`}>
          <StatusIcon passed={c.passed} />
          <div>
            <p className="check__name">
              {c.name}
              <span className="sr-only">{c.passed ? ': aprobado' : ': no verificado'}</span>
            </p>
            <p className="check__detail">{c.detail}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
