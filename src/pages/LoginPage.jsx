import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import Logo from '../components/brand/Logo.jsx';
import TextField from '../components/ui/TextField.jsx';
import Button from '../components/ui/Button.jsx';
import Alert from '../components/ui/Alert.jsx';
import RequestTrace from '../components/security/RequestTrace.jsx';

export default function LoginPage() {
  const { login, isAuthenticated, notice } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(form.username.trim(), form.password);
      navigate(location.state?.from?.pathname ?? '/', { replace: true });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login">
      <section className="login__panel">
        <div className="login__brand">
          <Logo size={40} />
          <span>Atalaya</span>
          <Link to="/servicio" className="login__service-link">Conoce el servicio →</Link>
        </div>

        <form className="login__form" onSubmit={onSubmit} noValidate>
          <h1 className="login__title">Inicia sesión</h1>
          <p className="login__lead">Centro de detección de intrusos: Suricata y Snort vigilan el sitio y avisan al equipo en segundos.</p>

          {notice && !error && <Alert tone="info">{notice}</Alert>}
          {error && <Alert kind={error.kind}>{error.message}</Alert>}

          <TextField id="username" name="username" label="Usuario" autoComplete="username"
            value={form.username} onChange={onChange} maxLength={30} required />
          <TextField id="password" name="password" type="password" label="Contraseña"
            autoComplete="current-password" value={form.password} onChange={onChange} maxLength={128} required />

          <Button type="submit" loading={loading} disabled={!form.username || !form.password}>Entrar</Button>

          <div className="login__accounts">
            <p>Cuentas de demostración</p>
            <ul>
              <li><strong>admin</strong>: monitoreo, demo, reinicio de contadores y auditoría</li>
              <li><strong>analista</strong>: monitoreo y alertas (sin auditoría)</li>
              <li><strong>cliente</strong>: portal "Mi sitio" con el estado de su protección</li>
            </ul>
          </div>
        </form>
      </section>

      <aside className="login__aside" aria-label="Dónde vigila cada sensor">
        <h2 className="login__aside-title">Dos sensores, dos puntos de vigilancia</h2>
        <p className="login__aside-lead">Suricata observa la red del frontend y Snort el servidor del backend. Cada alerta llega al panel y a Telegram.</p>
        <RequestTrace />
      </aside>
    </main>
  );
}
