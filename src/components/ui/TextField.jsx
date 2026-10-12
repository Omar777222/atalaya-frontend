export default function TextField({ label, id, hint, ...props }) {
  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>{label}</label>
      <input className="field__input" id={id} aria-describedby={hint ? `${id}-hint` : undefined} {...props} />
      {hint && <p className="field__hint" id={`${id}-hint`}>{hint}</p>}
    </div>
  );
}
