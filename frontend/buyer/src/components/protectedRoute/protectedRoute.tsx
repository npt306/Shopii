import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './authContext';

export const ProtectedRoute = () => {
  const { isAuthenticated, loading, status } = useAuth();

  // Show loading UI while auth status is being determined
  if (loading) {
    return <div>Loading...</div>;
  }

  // Redirect if user is banned
  if (status === 'banned') {
    return (
      <Navigate
        to="/login"
        replace
        state={{ error: 'Your account has been banned.' }}
      />
    );
  }

  // Redirect if user is not authenticated
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ error: 'Something is wrong with the session.' }}
      />
    );
  }

  // Authenticated and not banned → render nested route
  return <Outlet />;
};
