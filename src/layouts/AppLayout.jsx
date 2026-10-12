import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import Logo from '../components/brand/Logo.jsx';
import SessionTimer from '../components/security/SessionTimer.jsx';
import { ROLES } from '../constants/security.js';

const NAV = [
  { to: '/', label: 'Resumen', end: true },
  { to: '/inventario', label: 'Inventario' },
  { to: '/auditoria', label: 'Auditoría', adminOnly: true },
];

export default function AppLayout() {
  const { user, expiresAt, logout } = useAuth();
  const isSecure = window.location.protocol === 'https:';

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="sidebar__brand">
          <Logo inverted />
          <span>Atalaya</span>
        </div>

        <nav className="sidebar__nav" aria-label="Secciones">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className="sidebar__link">
              <span>{item.label}</span>
              {item.adminOnly && user.role !== ROLES.ADMIN && (
                <span className="sidebar__lock">Solo administración</span>
              )}
            </NavLink>
          ))}
        </nav>

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
    </div>
  );
}
