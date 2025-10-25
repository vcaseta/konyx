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
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, password }),
      });

      if (!res.ok) throw new Error("Usuario o contraseña incorrectos");

      const data = await res.json();

      // Guardamos token de sesión
      setToken(data.token);
      sessionStorage.setItem("konyx_token", data.token);

      // SOLO guardar contraseña global si aún no existe (primer uso)
      if (!sessionStorage.getItem("konyx_password")) {
        sessionStorage.setItem("konyx_password", password);
      }

      router.replace("/dashboard");
    } catch (error: any) {
      setMsg(error.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center bg-no-repeat bg-center bg-cover p-4"
      style={{
        backgroundImage: "url(/fondo.png)",
        backgroundSize: "100% 100%",
      }}
    >
      <div className="w-full max-w-sm bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-md">
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
          onChange={(e) => {
            setUser(e.target.value);
            if (msg) setMsg(null);
          }}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (msg) setMsg(null);
          }}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <button
          onClick={handleLogin}
          disabled={!user || !password || loading}
          className={`w-full py-2 rounded-lg text-white font-semibold transition ${
            !user || !password || loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {loading ? "Accediendo..." : "Entrar"}
        </button>
      </div>
    </main>
  );
}
