import { AnchorHTMLAttributes } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './authContext';

interface ProtectedExternalLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
}

export function ProtectedExternalLink({ to, children, ...rest }: ProtectedExternalLinkProps) {
  const { verifyAuth } = useAuth();
  const navigate = useNavigate();

  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    const { status, isAuthenticated } = await verifyAuth();

    if (status === 'banned') {
      localStorage.clear();
      navigate('/login', {
        replace: true,
        state: { error: 'Your account has been banned.' },
      });
      return;
    }

    if (!isAuthenticated) {
      localStorage.clear();
      navigate('/login', {
        replace: true,
        state: { error: 'You must log in to access this link.' },
      });
      return;
    }

    window.location.href = to;
  };

  return (
    <a href={to} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}
