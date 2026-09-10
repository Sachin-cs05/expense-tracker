import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("fintrack-token");

    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    api.setToken(storedToken);

    (async () => {
      try {
        const { user: currentUser } = await api.getMe();
        setUser(currentUser);
      } catch {
        api.clearToken();
        localStorage.removeItem("fintrack-token");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (payload) => {
    const response = await api.login(payload);
    api.setToken(response.token);
    localStorage.setItem("fintrack-token", response.token);
    setUser(response.user);
    return response.user;
  }, []);

  const register = useCallback(async (payload) => {
    return api.register(payload);
  }, []);

  const logout = useCallback(() => {
    api.clearToken();
    localStorage.removeItem("fintrack-token");
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const { user: currentUser } = await api.getMe();
    setUser(currentUser);
    return currentUser;
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, login, register, logout, refreshUser, setUser }),
    [user, isLoading, login, register, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
