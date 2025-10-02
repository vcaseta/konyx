@@ -1,3 +1,4 @@
// app/components/Login.tsx
"use client";

import { useState } from "react";
@@ -6,60 +7,63 @@ import { apiLogin } from "../lib/api";
export default function Login({ onOk }: { onOk: (token: string) => void }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setErr(null);
    setLoading(true);
    try {
      const token = await apiLogin(user, pass);
      localStorage.setItem("konyx_token", token);
      onOk(token);
    } catch (err: any) {
      setError(err?.message || "No se pudo iniciar sesión");
    } catch (error: any) {
      setErr(error?.message || "No se pudo iniciar sesión");
    } finally {
      setLoading(false);
    }
  };
  }

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white/90 backdrop-blur rounded-2xl p-6 space-y-4"
    >
    <form onSubmit={onSubmit} className="bg-white/90 backdrop-blur rounded-2xl p-6 space-y-4">
      <h1 className="text-2xl font-semibold text-center">Acceso a Konyx</h1>

      {error ? (
      {err && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
          {err}
        </p>
      ) : null}
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Usuario</label>
      <div className="space-y-2">
        <label className="block text-sm font-medium">Usuario</label>
        <input
          type="text"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-500"
          placeholder="Usuario"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="admin"
          autoComplete="username"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Contraseña</label>
      <div className="space-y-2">
        <label className="block text-sm font-medium">Contraseña</label>
        <input
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-500"
          placeholder="Contraseña"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="••••••"
          autoComplete="current-password"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition"
        disabled={loading}
        className="w-full rounded-lg bg-indigo-600 text-white font-medium py-2 hover:bg-indigo-700 disabled:opacity-50"
      >
        Entrar
        {loading ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
