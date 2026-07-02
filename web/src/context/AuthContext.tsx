import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { api, setAuthToken, clearAuthToken, getAuthToken, getStoredUser, setStoredUser } from '../api/client.js';
import type { User } from '../types/index.js';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

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

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
