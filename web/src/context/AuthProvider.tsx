import { useState, useCallback, type ReactNode } from 'react';
import { api, setAuthToken, clearAuthToken, getAuthToken, getStoredUser, setStoredUser } from '../api/client.js';
import type { User } from '../types/index.js';
import { AuthContext } from './auth-context.js';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (!getAuthToken()) {
      return null;
    }
    return getStoredUser();
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await api.login(email, password);
      setAuthToken(result.token);
      setStoredUser(result.user);
      setUser(result.user);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (email: string, name: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await api.register(email, name, password);
      setAuthToken(result.token);
      setStoredUser(result.user);
      setUser(result.user);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearAuthToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
