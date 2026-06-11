import { Navigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';

const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated) {
    return <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />;
  }
  return children;
};

export default PublicRoute;