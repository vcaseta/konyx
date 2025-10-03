// app/context/AuthContext.tsx
"use client";

import { createContext, useContext, useState } from "react";

type AuthCtx = {
  token: string | null;
  setToken: (t: string | null) => void;
};

const Ctx = createContext<AuthCtx>({
  token: null,
  setToken: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // No persistimos el token -> siempre pide credenciales al recargar
  const [token, setToken] = useState<string | null>(null);

  return (
    <Ctx.Provider value={{ token, setToken }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  return useContext(Ctx);
}
