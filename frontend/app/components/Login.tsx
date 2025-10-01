'use client';

import { useState } from 'react';

type LoginProps = {
  onSubmit?: (user: string, pass: string) => void;
};

export default function Login({ onSubmit }: LoginProps) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');

  return (
    <form
      className="mt-8 w-full max-w-sm space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.(user, pass);
      }}
    >
      <div>
        <label className="block text-sm font-medium mb-1">Usuario</label>
        <input
          className="w-full rounded-md border px-3 py-2 outline-none focus:ring focus:ring-blue-200"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          placeholder="usuario"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Contraseña</label>
        <input
          type="password"
          className="w-full rounded-md border px-3 py-2 outline-none focus:ring focus:ring-blue-200"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          placeholder="••••••••"
          required
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-md bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
      >
        Entrar
      </button>
    </form>
  );
}
