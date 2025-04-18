import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./authContext";

export const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if(loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};