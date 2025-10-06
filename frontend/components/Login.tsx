"use client";

import { useState } from "react";
import { useAuth } from "../context/authContext";

export default function Login() {
  const { setToken } = useAuth();
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!user || !password) {
      setMsg("Rellena usuario y contraseña");
      return;
    }

    setLoading(true);
    setMsg(null);

    try {
      const res = await fetch("http://192.168.1.51:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, password }),
      });

      if (!res.ok) throw new Error("Usuario o contraseña incorrectos");

      const data = await res.json();
      if (!data.token) throw new Error("Token no recibido");

      // Guardar token en estado global y storage
      setToken(data.token);
      sessionStorage.setItem("konyx_token", data.token);
      localStorage.setItem("konyx_token", data.token);

      // Redirigir al dashboard
      window.location.href = "/dashboard";
    } catch (error: any) {
      setMsg(error.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white/80 p-6 rounded-xl shadow-md w-full max-w-sm">
        <div className="flex justify-center mb-4">
          <img src="/logo.png" className="h-48 w-auto" alt="Logo" />
        </div>
        <h2 className="text-2xl font-bold mb-4 text-center">Iniciar Sesión</h2>
        {msg && <p className="text-red-600 mb-2 text-center">{msg}</p>}
        <input
          type="text"
          placeholder="Usuario"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={handleLogin}
          disabled={loading}
          className={`w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {loading ? "Iniciando..." : "Entrar"}
        </button>
      </div>
    </div>
  );
}

