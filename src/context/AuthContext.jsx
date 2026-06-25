import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as apiLogin, getMe } from '../api/auth';
import apiClient from '../api/client';

const AuthContext = createContext(null);

const TOKEN_KEY = 'agentesia_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Inyectar token en todas las peticiones axios
  useEffect(() => {
    const interceptor = apiClient.interceptors.request.use((config) => {
      const t = localStorage.getItem(TOKEN_KEY);
      if (t) config.headers.Authorization = `Bearer ${t}`;
      return config;
    });
    return () => apiClient.interceptors.request.eject(interceptor);
  }, []);

  // Al arrancar: validar token guardado
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (!storedToken) { setLoading(false); return; }

    getMe(storedToken)
      .then((u) => { setUser(u); setToken(storedToken); })
      .catch(() => { localStorage.removeItem(TOKEN_KEY); setToken(null); })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (username, password) => {
    setError(null);
    const { access_token } = await apiLogin(username, password);
    localStorage.setItem(TOKEN_KEY, access_token);
    setToken(access_token);
    const me = await getMe(access_token);
    setUser(me);
    return me;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, error, setError, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
