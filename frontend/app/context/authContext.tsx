"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthContextType {
  token: string | null;
  setToken: (t: string | null) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // ======================================================
  // 🔐 Inicializar token desde sessionStorage y verificar
  // ======================================================
  useEffect(() => {
    const storedToken = sessionStorage.getItem("konyx_token");

    const verifyToken = async (token: string) => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/verify`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Token inválido");

        const data = await res.json();
        if (data.valid) {
          setTokenState(token);
        } else {
          sessionStorage.removeItem("konyx_token");
          setTokenState(null);
        }
      } catch {
        sessionStorage.removeItem("konyx_token");
        setTokenState(null);
      } finally {
        setLoading(false);
      }
    };

    if (storedToken) {
      verifyToken(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  // ======================================================
  // 🔄 Mantener token sincronizado con sessionStorage
  // ======================================================
  const setToken = (newToken: string | null) => {
    setTokenState(newToken);
    if (newToken) {
      sessionStorage.setItem("konyx_token", newToken);
    } else {
      sessionStorage.removeItem("konyx_token");
    }
  };

  return (
    <AuthContext.Provider value={{ token, setToken, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
