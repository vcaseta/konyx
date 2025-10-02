"use client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

import { useEffect, useState } from "react";
import Login from "./components/Login";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";

export default function Page() {
  const [token, setToken] = useState<string | null>(null);

  // Cargar token (si existe) y evitar que el login desaparezca “al aire”
  useEffect(() => {
    const t = typeof window !== "undefined" ? localStorage.getItem("konyx_token") : null;
    if (t) setToken(t);
  }, []);

  function handleOk(t: string) {
    // Guardar token y redirigir de forma fiable
    localStorage.setItem("konyx_token", t);
    setToken(t);
    window.location.href = "/dashboard";
  }

  return (
    <main
      className="min-h-screen bg-no-repeat bg-center bg-cover flex items-center justify-center p-4"
      style={{
        backgroundImage: "url(/fondo.png)",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="w-full max-w-sm">
        {/* Logo grande encima del formulario */}
        <div className="flex justify-center mb-6">
          <img
            src="/logo.png"
            alt="Konyx"
            className="h-28 w-auto drop-shadow-md"
          />
        </div>

        {!token ? (
          <Login onOk={handleOk} />
        ) : (
          <div className="bg-white/90 backdrop-blur rounded-2xl shadow p-6 text-center">
            <p className="text-sm text-gray-700">
              Sesión iniciada. Redirigiendo…
            </p>
          </div>
        )}

        <p className="text-xs text-white/80 text-center mt-4">
          API: {API_URL || "no configurada (NEXT_PUBLIC_BACKEND_URL)"}
        </p>
      </div>
    </main>
  );
}

