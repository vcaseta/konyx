// frontend/app/context/AuthContext.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getAuthToken, setAuthToken } from "../lib/api";

type AuthCtx = {
  token: string | null;
  setToken: (t: string | null) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthCtx>({
  token: null,
  setToken: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);

  useEffect(() => {
    setTokenState(getAuthToken());
  }, []);

  const setToken = (t: string | null) => {
    setAuthToken(t);
    setTokenState(t);
  };

  const logout = () => setToken(null);

  return (
    <AuthContext.Provider value={{ token, setToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
