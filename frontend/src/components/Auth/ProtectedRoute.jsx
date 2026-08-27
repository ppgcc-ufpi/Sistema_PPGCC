import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/authContext';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="auth-route-status">Verificando sessão...</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (roles && !roles.includes(user.perfil)) return <Navigate to="/portal" replace />;
  return children;
};

export default ProtectedRoute;
