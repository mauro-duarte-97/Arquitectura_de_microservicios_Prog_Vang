import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  clearSession,
  getStoredToken,
  getStoredUser,
  persistSession,
} from "../services/apiClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [token, setToken] = useState(() => getStoredToken());
  const [isHydrating, setIsHydrating] = useState(false);

  useEffect(() => {
    // Si en algún momento se invalida el token (ej. respuesta 401 del backend),
    // limpiamos también el estado de React. Reaccionamos a:
    //  - cambios externos del storage (otra pestaña)
    //  - evento custom emitido por apiClient al recibir 401 en esta pestaña
    function syncFromStorage() {
      setToken(getStoredToken());
      setUser(getStoredUser());
    }
    function handleUnauthorized() {
      setToken(null);
      setUser(null);
    }
    window.addEventListener("storage", syncFromStorage);
    window.addEventListener("code-audit-ai:unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("storage", syncFromStorage);
      window.removeEventListener("code-audit-ai:unauthorized", handleUnauthorized);
    };
  }, []);

  const login = useCallback((sessionPayload) => {
    // sessionPayload: { token, user }
    persistSession(sessionPayload);
    setToken(sessionPayload.token);
    setUser(sessionPayload.user);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      isHydrating,
      setIsHydrating,
      login,
      logout,
    }),
    [user, token, isHydrating, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth() debe usarse dentro de <AuthProvider>");
  }
  return ctx;
}
