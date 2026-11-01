import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useIdsLive } from '../hooks/useIdsLive.js';
import Logo from '../components/brand/Logo.jsx';
import SessionTimer from '../components/security/SessionTimer.jsx';
import ToastStack from '../components/ids/ToastStack.jsx';
import { ROLES } from '../constants/security.js';

// Íconos de trazo simple (sin librerías)
const ICONS = {
  monitor: 'M3 13h4l3-8 4 14 3-6h4',
  alerts: 'M12 3a6 6 0 0 0-6 6v4l-2 3h16l-2-3V9a6 6 0 0 0-6-6zM10 19a2 2 0 0 0 4 0',
  sensors: 'M12 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0M7.8 16.2a6 6 0 0 1 0-8.4M16.2 7.8a6 6 0 0 1 0 8.4M5 19a10 10 0 0 1 0-14M19 5a10 10 0 0 1 0 14',
  demo: 'M7 4l12 8-12 8z',
  audit: 'M6 3h9l3 3v15H6zM9 10h6M9 14h6M9 18h4',
  site: 'M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6zM8.5 12l2.5 2.5 4.5-5',
};

// roles: quién ve cada opción del menú (el servidor vuelve a comprobarlo en cada petición)
const NAV = [
  { to: '/', label: 'Centro de monitoreo', icon: 'monitor', end: true, roles: ['admin', 'analyst'] },
  { to: '/alertas', label: 'Alertas en vivo', icon: 'alerts', badge: true, roles: ['admin', 'analyst'] },
  { to: '/sensores', label: 'Sensores y reglas', icon: 'sensors', roles: ['admin', 'analyst'] },
  { to: '/demo', label: 'Demo en vivo', icon: 'demo', roles: ['admin', 'analyst'] },
  { to: '/mi-sitio', label: 'Mi sitio', icon: 'site', roles: ['client', 'admin'], hint: 'Vista del cliente' },
  { to: '/auditoria', label: 'Auditoría', icon: 'audit', adminOnly: true, roles: ['admin', 'analyst'] },
];

export default function AppLayout() {
  const { user, expiresAt, logout } = useAuth();
  const { alerts } = useIdsLive();
  const isSecure = window.location.protocol === 'https:';
  const recent = alerts.filter((a) => Date.now() - new Date(a.timestamp).getTime() < 5 * 60 * 1000).length;

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="sidebar__brand">
          <Logo inverted />
          <div>
            <span>Atalaya</span>
            <small className="sidebar__tagline">Detección de intrusos</small>
          </div>
        </div>

        <nav className="sidebar__nav" aria-label="Secciones">
          {NAV.filter((item) => item.roles.includes(user.role)).map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className="sidebar__link">
              <svg className="sidebar__icon" viewBox="0 0 24 24" aria-hidden="true"><path d={ICONS[item.icon]} /></svg>
              <span className="sidebar__label">{item.label}</span>
              {item.badge && recent > 0 && <span className="sidebar__count" title="Alertas de los últimos 5 minutos">{recent > 99 ? '99+' : recent}</span>}
              {item.adminOnly && user.role !== ROLES.ADMIN && <span className="sidebar__lock">Solo admin</span>}
              {item.hint && user.role === ROLES.ADMIN && <span className="sidebar__lock">{item.hint}</span>}
            </NavLink>
          ))}
        </nav>

        {user.role !== ROLES.CLIENT && (
          <div className="sidebar__sensors" aria-label="Sensores">
            <p><span className="dot dot--suricata" aria-hidden="true" /> Suricata · NIDS frontend</p>
            <p><span className="dot dot--snort" aria-hidden="true" /> Snort · HIDS backend</p>
          </div>
        )}

        <div className="sidebar__user">
          <p className="sidebar__user-name">{user.displayName}</p>
          <p className="sidebar__user-role">Usuario: {user.username}</p>
          <button type="button" className="btn btn--ghost-inverted" onClick={logout}>Cerrar sesión</button>
        </div>
      </aside>

      <div className="shell__main">
        <header className="topbar">
          <span className={`topbar__channel ${isSecure ? 'topbar__channel--secure' : ''}`}>
            {isSecure ? 'Conexión cifrada (HTTPS)' : 'Entorno local de desarrollo'}
          </span>
          <SessionTimer expiresAt={expiresAt} />
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
      <ToastStack />
    </div>
  );
}
