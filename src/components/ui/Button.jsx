export default function Button({ variant = 'primary', loading = false, loadingText = 'Verificando…', children, ...props }) {
  return (
    <button className={`btn btn--${variant}`} disabled={loading || props.disabled} {...props}>
      {loading ? loadingText : children}
    </button>
  );
}
