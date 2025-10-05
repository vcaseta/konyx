"use client";

import { useState } from "react";

interface LoginProps {
  onOk: (token: string) => void;
}

export default function Login({ onOk }: LoginProps) {
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) throw new Error("Contraseña incorrecta");
      const data = await res.json();
      onOk(data.token);
    } catch (error: any) {
      setMsg(error.message);
    }
  };

  return (
    <div className="bg-white/80 p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">Iniciar Sesión</h2>
      {msg && <p className="text-red-600 mb-2">{msg}</p>}
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <button
        onClick={handleLogin}
        className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
      >
        Entrar
      </button>
    </div>
  );
}
