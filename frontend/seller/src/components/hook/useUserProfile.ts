import { useState, useEffect } from 'react';
import axios from 'axios';
import { EnvValue } from '../../env-value/envValue';
export interface UserProfile {
  // Adjust according to your JWT payload structure
  realm_access?: {
    roles: string[];
  };
  [key: string]: any;
}

export const useUserProfile = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  axios.defaults.withCredentials = true;

  useEffect(() => {
    // http://localhost:3003/Users/me for testing local
    // http://34.58.241.34:3003/Users/me for testing on server
    axios.get<UserProfile>(`${EnvValue.AUTH_SERVICE_URL}/Users/me`, { withCredentials: true })
      .then((response) => {
        console.log('User profile:', response.data);
        setUser(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching user profile:', err);
        setError('Failed to load user profile');
        setLoading(false);
      });
  }, []);

  return { user, loading, error };
};
