import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

function PrivateRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return isAuthenticated ? <Outlet /> : <Navigate to='/sign-in' />;
}

export default PrivateRoute;
