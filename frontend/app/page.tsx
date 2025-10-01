// frontend/app/page.tsx
"use client";

import { useState } from "react";
import { apiLogin as login, API_BASE } from "./lib/api";

export default function Page() {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(user, pass); // guarda el token en localStorage
      // Redirige al dashboard:
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err?.message || "No se pudo iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="min-h-screen bg-cover bg-center bg-no-repeat flex flex-col items-center justify-start p-4"
      style={{ backgroundImage: "url(/fondo.png)" }}
    >
      {/* Logo grande, más arriba */}
      <div className="w-full max-w-sm mt-10 mb-6 flex justify-center">
        <img
          src="/logo.png"
          alt="Konyx"
          className="h-28 w-auto drop-shadow-md"
        />
      </div>

      {/* Solo el cuadro de credenciales (sin overlay detrás) */}
      <div className="w-full max-w-sm">
        <form
          onSubmit={onSubmit}
          className="bg-white/90 backdrop-blur rounded-2xl shadow-lg p-6 space-y-4"
        >
          <h1 className="text-2xl font-semibold text-center">Acceso a Konyx</h1>

          {error ? (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {error}
            </p>
          ) : null}

          <div className="space-y-2">
            <label className="block text-sm font-medium">Usuario</label>
            <input
              type="text"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="admin"
              autoComplete="username"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Contraseña</label>
            <input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="••••••"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 text-white font-medium py-2 hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

          {/* Info de API visible para diagnóstico */}
          <p className="text-xs text-gray-500 text-center mt-2">
            API: {API_BASE || "no configurada (NEXT_PUBLIC_BACKEND_URL)"}
          </p>
        </form>
      </div>
    </main>
  );
}

