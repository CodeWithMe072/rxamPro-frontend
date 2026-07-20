import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { authService } from '../services/auth.service';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser]           = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBanned, setIsBanned]   = useState(false); // shows ban modal when true

  // Ref to skip the getMe() sync when login() just set the user directly
  const skipSyncRef = useRef(false);

  // Listen for account-banned events fired by the api.js interceptor
  useEffect(() => {
    const handleBanned = () => setIsBanned(true);
    window.addEventListener('account-banned', handleBanned);
    return () => window.removeEventListener('account-banned', handleBanned);
  }, []);

  // ── Bootstrap: restore session on first load ──────────────────────────────
  useEffect(() => {
    const boot = async () => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');

      if (!token) {
        setIsLoading(false);
        return;
      }

      // Optimistically restore cached user so the UI renders immediately
      try {
        const cached = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (cached) setUser(JSON.parse(cached));
      } catch (_) {}

      // Then fetch fresh user from server
      try {
        const fresh = await authService.getMe();
        if (fresh) {
          setUser(fresh);
          const store = localStorage.getItem('token') ? localStorage : sessionStorage;
          store.setItem('user', JSON.stringify(fresh));
        }
      } catch (e) {
        // Only log out on definite auth errors, not network issues
        if (e?.response?.status === 401) {
          _clearSession();
        }
        console.warn('Session sync failed:', e?.message);
      } finally {
        setIsLoading(false);
      }
    };

    boot();
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = async (identifier, password, rememberMe = true) => {
    const response = await authService.login(identifier, password);
    const { user: loggedUser, accessToken, refreshToken } = response.data;

    // rememberMe=true  → localStorage  (survives reloads/restarts)
    // rememberMe=false → sessionStorage (cleared on tab close)
    const store       = rememberMe ? localStorage  : sessionStorage;
    const otherStore  = rememberMe ? sessionStorage : localStorage;

    otherStore.removeItem('token');
    otherStore.removeItem('refreshToken');
    otherStore.removeItem('user');

    store.setItem('token',        accessToken);
    store.setItem('refreshToken', refreshToken);
    store.setItem('user',         JSON.stringify(loggedUser));

    // Set user directly — no isLoading dance needed
    setUser(loggedUser);

    return loggedUser;
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = () => {
    try { authService.logout(); } catch (_) {}
    _clearSession();
  };

  const _clearSession = () => {
    ['token', 'refreshToken', 'user'].forEach(k => {
      localStorage.removeItem(k);
      sessionStorage.removeItem(k);
    });
    setUser(null);
  };

  // ── Optimistic profile update (no re-fetch needed) ────────────────────────
  const updateProfile = (data) => {
    setUser(prev => {
      const next = { ...prev, ...data };
      const store = localStorage.getItem('token') ? localStorage : sessionStorage;
      store.setItem('user', JSON.stringify(next));
      return next;
    });
  };

  // ── Token getter (used by api interceptor) ────────────────────────────────
  const getToken = () =>
    localStorage.getItem('token') || sessionStorage.getItem('token');

  return (
    <AuthContext.Provider value={{
      user,
      token: getToken(),
      isAuthenticated: !!user,
      isLoading,
      isBanned,
      login,
      logout,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
