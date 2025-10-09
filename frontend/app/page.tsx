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
      // Leer contraseña global o usar por defecto "1234"
      const storedPassword = sessionStorage.getItem("konyx_password") || "1234";

      // Validación local (sin backend)
      if (password !== storedPassword) {
        throw new Error("Contraseña incorrecta");
      }

      // Simulación de token (ya que no dependemos del backend aún)
      const fakeToken = "token_" + Math.random().toString(36).slice(2);
      setToken(fakeToken);
      sessionStorage.setItem("konyx_token", fakeToken);

      router.replace("/dashboard");
    } catch (error: any) {
      setMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center bg-no-repeat bg-center bg-cover p-4"
      style={{ backgroundImage: "url(/fondo.png)", backgroundSize: "100% 100%" }}
    >
      <div className="w-full max-w-sm bg-white/80 p-6 rounded-xl shadow-md backdrop-blur-md">
        <div className="flex justify-center mb-4">
          <img src="/logo.png" className="h-48 w-auto" alt="Konyx" />
        </div>

        <h2 className="text-2xl font-bold mb-4 text-center">Iniciar Sesión</h2>

        {msg && <p className="text-red-600 mb-2 text-center">{msg}</p>}

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
