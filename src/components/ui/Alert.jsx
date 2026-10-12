const TITLES = { waf: 'Bloqueado por AWS WAF', forbidden: 'Acceso denegado', rate: 'Demasiadas solicitudes' };

export default function Alert({ tone = 'danger', kind, children }) {
  if (!children) return null;
  return (
    <div className={`alert alert--${tone}`} role={tone === 'danger' ? 'alert' : 'status'}>
      {TITLES[kind] && <strong className="alert__title">{TITLES[kind]}</strong>}
      <span>{children}</span>
    </div>
  );
}
