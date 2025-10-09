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
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setMsg(null);
    setLoading(true);

    try {
      const res = await fetch("http://192.168.1.51:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, password }),
      });

      if (!res.ok) throw new Error("Usuario o contraseña incorrectos");

      const data = await res.json();

      // Guardamos solo el token de sesión (no la contraseña global)
      setToken(data.token);
      sessionStorage.setItem("konyx_token", data.token);

      // La contraseña global se gestiona solo desde PanelConfig
      router.replace("/dashboard");
    } catch (error: any) {
      setMsg(error.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-sm bg-white/80 p-6 rounded-xl shadow-md">
        <div className="flex justify-center mb-4">
          <img src="/logo.png" className="h-48 w-auto" alt="Konyx" />
        </div>

        <h2 className="text-2xl font-bold mb-4 text-center">Iniciar Sesión</h2>

        {msg && (
          <p
            className={`mb-3 text-center ${
              msg.includes("incorrectos") ? "text-red-600" : "text-green-600"
            }`}
          >
            {msg}
          </p>
        )}

        <input
          type="text"
          placeholder="Usuario"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className={`w-full py-2 rounded-lg text-white transition ${
            loading
              ? "bg-indigo-300 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </div>
    </main>
  );
}

