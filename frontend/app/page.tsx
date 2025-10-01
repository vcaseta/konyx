"use client";

import { useState } from "react";
import Image from "next/image";

function Login({ onSubmit }: { onSubmit?: (user: string, pass: string) => void }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) onSubmit(user, pass);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-4 w-80">
      <input
        type="text"
        placeholder="Usuario"
        value={user}
        onChange={(e) => setUser(e.target.value)}
        className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={pass}
        onChange={(e) => setPass(e.target.value)}
        className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
      />
      <button
        type="submit"
        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg shadow"
      >
        Entrar
      </button>
    </form>
  );
}

export default function Home() {
  const [token, setToken] = useState<string | null>(null);

  const handleLogin = (user: string, pass: string) => {
    console.log("Login:", user, pass);
    setToken("fake-token"); // luego cambiar por login real
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      {!token ? (
        <div className="flex flex-col items-center space-y-8 bg-white/80 rounded-2xl p-10 shadow-lg">
          {/* Logo grande */}
          <Image
            src="/logo.png"
            alt="Konyx"
            width={220}
            height={220}
            className="mb-4"
          />

          {/* Caja login */}
          <Login onSubmit={handleLogin} />
        </div>
      ) : (
        <section className="bg-white/80 rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-center">Bienvenido a Konyx</h2>
          <p>Ya estás autenticado 🚀</p>
        </section>
      )}
    </main>
  );
}
