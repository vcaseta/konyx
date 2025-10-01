"use client";

import { useState } from "react";

type Props = {
  onSubmit?: (user: string, pass: string) => void;
};

export default function Login({ onSubmit }: Props) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");

  return (
    <form
      className="bg-white/10 backdrop-blur-md rounded-2xl p-6 w-full max-w-md border border-white/10"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.(user, pass);
      }}
    >
      <h2 className="text-xl font-semibold mb-4">Acceso</h2>
      <label className="block text-sm mb-1">Usuario</label>
      <input
        className="w-full mb-3 px-3 py-2 rounded bg-white/90 text-black outline-none"
        value={user}
        onChange={(e) => setUser(e.target.value)}
        placeholder="usuario"
        required
      />
      <label className="block text-sm mb-1">Contraseña</label>
      <input
        type="password"
        className="w-full mb-4 px-3 py-2 rounded bg-white/90 text-black outline-none"
        value={pass}
        onChange={(e) => setPass(e.target.value)}
        placeholder="••••••••"
        required
      />
      <button
        className="w-full py-2 rounded-xl bg-brand-600 hover:bg-brand-500 transition font-semibold"
        type="submit"
      >
        Entrar
      </button>
    </form>
  );
}
