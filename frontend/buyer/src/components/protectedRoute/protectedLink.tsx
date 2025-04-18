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
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (loading) {
      // still checking – don’t do anything yet
      e.preventDefault();
      return;
    }

    if (!isAuthenticated) {
      // block the external navigation
      e.preventDefault();
      // clear any stale state
      localStorage.clear();
      // send them to your internal login page
      navigate('/login', { replace: true });
    }
    // otherwise do nothing and let the <a> work normally
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
