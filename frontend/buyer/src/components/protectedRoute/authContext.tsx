import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { EnvValue } from '../../env-value/envValue';

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  verifyAuth: () => Promise<VerifyResult>;
  status: 'ok' | 'banned' | 'unauthenticated';
}

interface VerifyResult {
  isAuthenticated: boolean;
  status: 'ok' | 'banned' | 'unauthenticated';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'ok' | 'banned' | 'unauthenticated'>('unauthenticated');

  const verifyAuth = async (): Promise<VerifyResult> => {
    setLoading(true);

    try {
      const response = await fetch(`${EnvValue.AUTH_SERVICE_URL}/Users/verify-token`, {
        credentials: 'include',
      });
      const data = await response.json();

      let newStatus: VerifyResult['status'];
      let newAuth: boolean;

      if (data.message === 'banned') {
        localStorage.clear();
        newStatus = 'banned';
        newAuth = false;
      } else if (response.ok && data.isAuthenticated) {
        newStatus = 'ok';
        newAuth = true;
      } else {
        localStorage.clear();
        newStatus = 'unauthenticated';
        newAuth = false;
      }

      setStatus(newStatus);
      setIsAuthenticated(newAuth);

      return { status: newStatus, isAuthenticated: newAuth };
    } catch {
      setStatus('unauthenticated');
      setIsAuthenticated(false);
      return { status: 'unauthenticated', isAuthenticated: false };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    verifyAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, verifyAuth, status }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
