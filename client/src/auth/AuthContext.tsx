import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, setToken } from '../api/client';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (identifier: string, password: string, remember?: boolean) => Promise<User>;
  logout: () => void;
  refresh: () => Promise<void>;
  setUser: (u: User) => void;
}

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('quophy_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get('/auth/me')
      .then((r) => setUser(r.data.user))
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (identifier: string, password: string, remember = false) => {
    const r = await api.post('/auth/login', { identifier, password, remember });
    setToken(r.data.token);
    setUser(r.data.user);
    return r.data.user as User;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const refresh = async () => {
    const r = await api.get('/auth/me');
    setUser(r.data.user);
  };

  return (
    <Ctx.Provider value={{ user, loading, login, logout, refresh, setUser }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
