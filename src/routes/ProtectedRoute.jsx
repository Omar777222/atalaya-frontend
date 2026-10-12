import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import Spinner from '../components/ui/Spinner.jsx';

// Sin sesión no se entra; con roles, además se exige el rol correcto
export default function ProtectedRoute({ roles, children }) {
  const { status, isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (status === 'checking') {
    return <div className="fullscreen-center"><Spinner label="Verificando tu sesión con el servidor…" /></div>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/denegado" replace state={{ from: location }} />;
  }
  return children;
}
