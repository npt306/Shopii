import { Navigate, useLocation } from "react-router-dom";
import { useUserProfile } from './useUserProfile';
import { ReactNode, useEffect, useState } from 'react';
import { EnvValue } from '../../env-value/envValue';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const location = useLocation();
  const { user, loading: profileLoading, error } = useUserProfile();

  const [checkingToken, setCheckingToken] = useState(true);
  const [tokenStatus, setTokenStatus] = useState<'ok' | 'banned' | 'unauthenticated'>('ok');

  useEffect(() => {
    const verifyToken = async () => {
      setCheckingToken(true);
      try {
        const res = await fetch(`${EnvValue.AUTH_SERVICE_URL}/Users/verify-token`, {
          credentials: 'include',
        });
        const data = await res.json();

        if (data.message === 'banned') {
          setTokenStatus('banned');
        } else if (!data.isAuthenticated) {
          setTokenStatus('unauthenticated');
        } else {
          setTokenStatus('ok');
        }
      } catch (err) {
        setTokenStatus('unauthenticated');
      } finally {
        setCheckingToken(false);
      }
    };

    verifyToken();
  }, []);

  if (checkingToken || profileLoading) return <div>Loading...</div>;

  if (tokenStatus === 'banned') {
    window.location.href = `http://34.58.241.34:8000/login?error=${encodeURIComponent('You must log in to access this route.')}`;
    return null;
  }

  if (tokenStatus === 'unauthenticated') {
    window.location.href = `http://34.58.241.34:8000/login?error=${encodeURIComponent('You must log in to access this route.')}`;
    return null;
  }

  console.log(tokenStatus);


  if (error || !user) {
    return (
      <Navigate
        to="/portal/register"
        replace
        state={{ from: location }}
      />
    );
  }

  const hasSellerRole = Array.isArray(user.realm_access?.roles)
    ? user.realm_access.roles.includes("seller")
    : false;

  if (!hasSellerRole) {
    return (
      <Navigate
        to="/portal/register"
        replace
        state={{ from: location }}
      />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
