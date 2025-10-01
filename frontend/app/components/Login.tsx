"use client";

import { useState } from "react";
import { apiLogin } from "../lib/api";

export default function Login({ onOk }: { onOk: (token: string) => void }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const token = await apiLogin(user, pass);
      localStorage.setItem("konyx_token", token);
      onOk(token);
    } catch (err: any) {
      setError(err?.message || "No se pudo iniciar sesión");
    }
  };

  return (
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

      <div>
        <label className="block text-sm font-medium mb-1">Usuario</label>
        <input
          type="text"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-500"
          placeholder="Usuario"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Contraseña</label>
        <input
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-500"
          placeholder="Contraseña"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition"
      >
        Entrar
      </button>
    </form>
  );
}
