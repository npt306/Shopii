import { ReactNode, MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { EnvValue } from '../../env-value/envValue';

interface ProtectedLinkProps {
  to: string;
  children: ReactNode;
  className?: string;
}

export const ProtectedLink = ({ to, children, className }: ProtectedLinkProps) => {
  const navigate = useNavigate();

  const handleClick = async (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    try {
      const response = await fetch(`${EnvValue.AUTH_SERVICE_URL}/Users/verify-token`, {
        credentials: 'include',
      });
      const data = await response.json();

      if (data.message === 'banned') {
        localStorage.clear();
        // http://34.58.241.34:8000
        window.location.href = `http://34.58.241.34:8000/login?error=${encodeURIComponent('Your account has been banned.')}`;
        return;
      }

      if (!data.isAuthenticated || response.status !== 200) {
        localStorage.clear();
        window.location.href = `http://34.58.241.34:8000/login?error=${encodeURIComponent('You must log in to access this route.')}`;
        return;
      }

      navigate(to);
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.clear();
      window.location.href = `http://34.58.241.34:8000/login?error=${encodeURIComponent('Session expired. Please log in again.')}`;
    }
  };

  return (
    <a href={to} onClick={handleClick} className={className}>
      {children}
    </a>
  );
};
