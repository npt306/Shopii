import { Navigate, useLocation } from "react-router-dom";
import { useUserProfile } from './useUserProfile';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const location = useLocation();
  const { user, loading, error } = useUserProfile();

  // While loading, you can show a spinner or placeholder
  if (loading) return <div>Loading...</div>;

  // If there's an error or no user data, redirect to register
  if (error || !user) {
    return <Navigate to="/portal/register" replace state={{ from: location }} />;
  }

  // Check if the user has the seller role
  const hasSellerRole = user.realm_access && Array.isArray(user.realm_access.roles)
    ? user.realm_access.roles.includes("seller")
    : false;

  console.log('User roles:', user.realm_access?.roles);
  console.log('Has seller role:', hasSellerRole);

  if (!hasSellerRole) {
    return <Navigate to="/portal/register" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
