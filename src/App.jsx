import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import AppLayout from './layouts/AppLayout.jsx';
import LoginPage from './pages/LoginPage.jsx';
import ServicePage from './pages/ServicePage.jsx';
import MonitorPage from './pages/MonitorPage.jsx';
import AlertsPage from './pages/AlertsPage.jsx';
import SensorsPage from './pages/SensorsPage.jsx';
import DemoPage from './pages/DemoPage.jsx';
import ClientPage from './pages/ClientPage.jsx';
import AuditPage from './pages/AuditPage.jsx';
import ForbiddenPage from './pages/ForbiddenPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import { IdsLiveProvider } from './context/IdsLiveContext.jsx';
import { useAuth } from './hooks/useAuth.js';
import { ROLES, STAFF } from './constants/security.js';

// El cliente entra directo a "Mi sitio"; el equipo de seguridad al Centro de monitoreo
function Home() {
  const { user } = useAuth();
  return user.role === ROLES.CLIENT ? <Navigate to="/mi-sitio" replace /> : <MonitorPage />;
}

const staffOnly = (page) => <ProtectedRoute roles={STAFF}>{page}</ProtectedRoute>;

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/servicio" element={<ServicePage />} />

      {/* Todo lo de adentro exige una sesión válida; las alertas se consultan una sola vez para todas las páginas */}
      <Route element={<ProtectedRoute><IdsLiveProvider><AppLayout /></IdsLiveProvider></ProtectedRoute>}>
        <Route index element={<Home />} />
        <Route path="alertas" element={staffOnly(<AlertsPage />)} />
        <Route path="sensores" element={staffOnly(<SensorsPage />)} />
        <Route path="demo" element={staffOnly(<DemoPage />)} />
        <Route path="mi-sitio" element={<ProtectedRoute roles={[ROLES.CLIENT, ROLES.ADMIN]}><ClientPage /></ProtectedRoute>} />
        <Route path="auditoria" element={<ProtectedRoute roles={[ROLES.ADMIN]}><AuditPage /></ProtectedRoute>} />
        <Route path="denegado" element={<ForbiddenPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
