import { AnchorHTMLAttributes } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './authContext';

interface ProtectedExternalLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
}

export function ProtectedExternalLink({
  to,
  children,
  ...rest
}: ProtectedExternalLinkProps) {
  const { isAuthenticated, loading, verifyAuth } = useAuth();
  const navigate = useNavigate();

  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Always prevent default so we can decide what to do
    e.preventDefault();

    // If we’re already mid‑check, wait for it to finish
    if (loading) {
      await verifyAuth();
    } else {
      // otherwise trigger a fresh re‑check
      await verifyAuth();
    }

    if (!isAuthenticated) {
      // Not logged in → clear stale state & send to login
      localStorage.clear();
      navigate('/login', { replace: true });
    } else {
      // Logged in → manually fire the external navigation
      window.location.href = to;
    }
  };

  return (
    <a
      href={to}
      onClick={handleClick}
      {...rest}
    >
      {children}
    </a>
  );
}
