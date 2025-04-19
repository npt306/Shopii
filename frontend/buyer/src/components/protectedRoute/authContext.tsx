import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { EnvValue } from '../../env-value/envValue';

interface AuthContextType {
    isAuthenticated: boolean;
    loading: boolean;
    verifyAuth: () => Promise<void>;    // ← new
  }
  
  const AuthContext = createContext<AuthContextType|undefined>(undefined);
  
  export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
  
    // factor out the verifyAuth logic so we can call it from useEffect *and* externally
    const verifyAuth = async () => {
      setLoading(true);
      try {
        // 34.58.241.34
        // localhost
        const response = await fetch(`${EnvValue.AUTH_SERVICE_URL}/Users/verify-token`, {
        // const response = await fetch(`http://localhost:3003/Users/verify-token`, {
          credentials: 'include',
        });
        const data = await response.json();
        if (response.ok && data.isAuthenticated) {
          setIsAuthenticated(true);
        } else {
          localStorage.clear();
          setIsAuthenticated(false);
        }
      } catch {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
  
    // run once on mount
    useEffect(() => {
      verifyAuth();
    }, []);
  
    return (
      <AuthContext.Provider value={{ isAuthenticated, loading, verifyAuth }}>
        {children}
      </AuthContext.Provider>
    );
  };
  
  export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be inside AuthProvider');
    return ctx;
  };