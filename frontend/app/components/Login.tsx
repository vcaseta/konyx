"use client";

import { useState, useEffect } from "react";

export default function Login({ onOk }: { onOk: (token: string) => Promise<void> }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Inicializar usuario y contraseña desde .env si no existen
  useEffect(() => {
    if (!localStorage.getItem("konyx.user")) {
      localStorage.setItem("konyx.user", process.env.NEXT_PUBLIC_DEFAULT_USER ?? "admin");
    }
    if (!localStorage.getItem("konyx.pass")) {
      localStorage.setItem("konyx.pass", process.env.NEXT_PUBLIC_DEFAULT_PASS ?? "konyx123");
    }
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      // Leer usuario y contraseña vigente de localStorage
      const storedUser = localStorage.getItem("konyx.user")!;
      const storedPass = localStorage.getItem("konyx.pass")!;

      if (user === storedUser && pass === storedPass) {
        sessionStorage.setItem("konyx_session", "1"); // sesión temporal
        await onOk("dummy-token"); // redirige al dashboard
      } else {
        setErr("Usuario o contraseña incorrecta");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white/90 backdrop-blur rounded-2xl shadow-lg p-6 space-y-6 flex flex-col items-center"
    >
      {/* Logo dentro del cuadro */}
      <div className="mb-4">
        <img
          src="/logo.png"
          alt="Konyx"
          className="h-96 w-auto drop-shadow-md"
        />
      </div>

      {err && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 w-full text-center">
          {err}
        </p>
      )}

      <div className="w-full space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Usuario</label>
          <input
            type="text"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            placeholder="Nombre Usuario"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            autoComplete="off"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Contraseña</label>
          <input
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="••••••"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            autoComplete="new-password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 text-white font-medium py-2 hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </div>
    </form>
  );
}
