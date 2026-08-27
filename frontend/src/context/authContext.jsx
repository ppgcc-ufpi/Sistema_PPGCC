import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  ApiError,
  authenticatedRequest,
  clearSession,
  login as loginRequest,
  logout as logoutRequest,
  readSession,
} from '../services/apiClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(readSession()));

  useEffect(() => {
    let active = true;
    if (!readSession()) {
      setLoading(false);
      return undefined;
    }

    authenticatedRequest('/api/auth/me')
      .then((currentUser) => {
        if (active) setUser(currentUser);
      })
      .catch(() => clearSession())
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      await loginRequest(email, password);
      const currentUser = await authenticatedRequest('/api/auth/me');
      setUser(currentUser);
      return currentUser;
    } catch (error) {
      clearSession();
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      setUser(null);
    }
  }, []);

  const request = useCallback(async (path, options) => {
    try {
      return await authenticatedRequest(path, options);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) setUser(null);
      throw error;
    }
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    authenticated: Boolean(user),
    login,
    logout,
    request,
  }), [user, loading, login, logout, request]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider.');
  return context;
};
