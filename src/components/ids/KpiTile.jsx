export default function KpiTile({ label, value, hint, tone = 'neutral' }) {
  return (
    <div className={`kpi kpi--${tone}`}>
      <p className="kpi__label">{label}</p>
      <p className="kpi__value">{value}</p>
      {hint && <p className="kpi__hint">{hint}</p>}
    </div>
  );
}
