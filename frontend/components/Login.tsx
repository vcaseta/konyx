"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/authContext";

export default function LoginPage() {
  const router = useRouter();
  const { setToken } = useAuth();

  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  // ✅ Leer variable del entorno (sin fallback)
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  const handleLogin = async () => {
    setMsg(null);

    try {
      if (!BACKEND_URL) throw new Error("BACKEND_URL no configurada");

      const res = await fetch(`${BACKEND_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, password }),
      });

      if (!res.ok) throw new Error("Usuario o contraseña incorrectos");

      const data = await res.json();

      // 🔐 Guardar token
      setToken(data.token);
      sessionStorage.setItem("konyx_token", data.token);

      // 💾 Guardar contraseña solo la primera vez
      if (!sessionStorage.getItem("konyx_password")) {
        sessionStorage.setItem("konyx_password", password);
      }

      router.replace("/dashboard");
    } catch (error: any) {
      setMsg(error.message || "Error al conectar con el servidor");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-sm bg-white/80 p-6 rounded-xl shadow-md">
        <div className="flex justify-center mb-4">
          <img src="/logo.png" className="h-48 w-auto" alt="Konyx" />
        </div>

        <h2 className="text-2xl font-bold mb-4 text-center text-indigo-800">
          Iniciar Sesión
        </h2>

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
          className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          Entrar
        </button>
      </div>
    </main>
  );
}
