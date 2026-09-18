import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authAPI } from '../api/endpoints';
import { setStoredToken } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await authAPI.me();
        setUser(data.user);
        setToken(document.cookie.includes('token=') ? 'cookie' : null);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const login = useCallback(async (credentials) => {
    const data = await authAPI.login(credentials);
    setUser(data.user);
    setToken(data.token);
    setStoredToken(data.token); // persists auth across reloads when cookies are blocked cross-origin
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const data = await authAPI.register(payload);
    setUser(data.user);
    setToken(data.token);
    setStoredToken(data.token);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } finally {
      setUser(null);
      setToken(null);
      setStoredToken(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, loading, token, login, register, logout, setUser }),
    [user, loading, token, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
