"use client";

import { useState } from "react";
import Login from "./components/Login";

// Fuerza render dinámico (evita prerender/SSG)
export const dynamic = "force-dynamic";

export default function Page() {
  const [token, setToken] = useState<string | null>(null);

  return (
    <main
      className="min-h-screen bg-no-repeat bg-center bg-cover flex items-center justify-center p-4"
      style={{
        backgroundImage: "url(/fondo.png)",
        backgroundSize: "100% 100%",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="w-full max-w-sm">
        {/* Logo SIEMPRE encima */}
        <div className="flex justify-center mb-6">
          <img
            src="/logo.png"
            alt="Konyx"
            className="h-24 w-auto drop-shadow-md"
          />
        </div>

        {!token ? (
          <Login onOk={(t: string) => setToken(t)} />
        ) : (
          <div className="bg-white/90 backdrop-blur rounded-2xl shadow p-6 text-center">
            <p className="text-sm text-gray-700">
              Sesión iniciada. Redirigiendo al panel…
            </p>
            {/* Si ya tienes navegación automática en Login, esto es solo de cortesía */}
          </div>
        )}
      </div>
    </main>
  );
}

