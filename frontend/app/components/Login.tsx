"use client";

import { useState } from "react";
import { login } from "../lib/api"; // asegúrate de que existe esta función

export default function Login({ onOk }: { onOk: (token: string) => void }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const token = await login(user, pass);
      onOk(token);
    } catch (err: any) {
      setError(err?.message || "No se pudo iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl bg-white/85 backdrop-blur-md border border-white/30 p-6 space-y-4"
    >
      <h1 className="text-2xl font-semibold text-center">Acceso a Konyx</h1>

      {error ? (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </p>
      ) : null}

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">
          Usuario
        </label>
        <input
          type="text"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          className="block w-full rounded-xl bg-white border border-black/10 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="usuario"
          autoComplete="username"
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">
          Contraseña
        </label>
        <input
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          className="block w-full rounded-xl bg-white border border-black/10 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="••••••••"
          autoComplete="current-password"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full h-11 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 transition"
      >
        {loading ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
