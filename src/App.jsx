import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import AppLayout from './layouts/AppLayout.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import AssetsPage from './pages/AssetsPage.jsx';
import AuditPage from './pages/AuditPage.jsx';
import ForbiddenPage from './pages/ForbiddenPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import { ROLES } from './constants/security.js';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Todo lo de adentro exige una sesión válida */}
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="inventario" element={<AssetsPage />} />
        <Route
          path="auditoria"
          element={<ProtectedRoute roles={[ROLES.ADMIN]}><AuditPage /></ProtectedRoute>}
        />
        <Route path="denegado" element={<ForbiddenPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
