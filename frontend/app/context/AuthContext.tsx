"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { setAuthToken, getAuthToken } from "../lib/api";

type AuthCtx = {
  token: string | null;
  login: (tok: string) => void;
  logout: () => void;
};

const Ctx = createContext<AuthCtx>({ token: null, login: () => {}, logout: () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => { setToken(getAuthToken()); }, []);

  const login = (tok: string) => {
    setAuthToken(tok);
    setToken(tok);
  };

  const logout = () => {
    setAuthToken(null);
    setToken(null);
  };

  return <Ctx.Provider value={{ token, login, logout }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
