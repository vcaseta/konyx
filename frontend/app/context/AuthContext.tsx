"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getAuthToken, setAuthToken } from "../lib/api";

type AuthCtx = {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthCtx>({
  token: null,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);

  // hidrata token desde localStorage al montar
  useEffect(() => {
    setToken(getAuthToken());
  }, []);

  const login = (t: string) => {
    setAuthToken(t);
    setToken(t);
  };

  const logout = () => {
    setAuthToken(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
