"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiLogin } from "../lib/api";

export default function Login({ onOk }: { onOk: () => void }) {
  const router = useRouter();

  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const token = await apiLogin(user, pass);
      localStorage.setItem("konyx_token", token);
      onOk?.();
      router.push("/dashboard");
    } catch (error: any) {
      setErr(error?.message || "No se pudo iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-full space-y-4">
      <h1 className="text-2xl font-semibold text-center text-white drop-shadow">
        Acceso a Konyx
      </h1>

      {err && (
        <p className="text-sm text-red-100 bg-red-600/80 border border-red-300/50 rounded px-3 py-2">
          {err}
        </p>
      )}

      <div className="space-y-2">
        <label className="block text-sm font-medium text-white">Usuario</label>
        <input
          type="text"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          className="w-full rounded-lg border border-white/40 bg-white/90 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          placeholder="admin"
          autoComplete="username"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-white">Contraseña</label>
        <input
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          className="w-full rounded-lg border border-white/40 bg-white/90 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          placeholder="••••••"
          autoComplete="current-password"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-indigo-600 text-white font-medium py-2 hover:bg-indigo-700 disabled:opacity-60"
      >
        {loading ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
