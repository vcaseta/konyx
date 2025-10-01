'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export default function Page() {
  const router = useRouter();
  const [username, setUser] = useState('');
  const [password, setPass] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Si ya hay token, entrar directo a dashboard
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('konyx_token') : null;
    if (token) router.replace('/dashboard');
  }, [router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await axios.post(`${BACKEND_URL}/login`, { username, password });
      // Esperamos { access_token: string }
      const token = res.data?.access_token || res.data?.token;
      if (!token) throw new Error('Respuesta de login inválida');

      localStorage.setItem('konyx_token', token);

      // (Opcional) limpiar selección previa de empresa
      localStorage.removeItem('konyx_company');

      router.replace('/dashboard');
    } catch (err: any) {
      const msg =
        err?.response?.status === 401
          ? 'Credenciales inválidas'
          : err?.message || 'No se pudo iniciar sesión';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center p-4"
          style={{ backgroundImage: 'url(/fondo.png)' }}>
      <div className="w-full max-w-sm">
        {/* Logo grande encima del formulario */}
        <div className="flex justify-center mb-6">
          <img
            src="/logo.png"
            alt="Konyx"
            className="h-64 w-auto drop-shadow-md"
          />
        </div>

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

          <div className="space-y-1">
            <label className="text-sm font-medium">Usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUser(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="usuario"
              autoComplete="username"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPass(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white py-2 font-medium disabled:opacity-60"
          >
            {loading ? 'Entrando…' : 'Entrar'}
          </button>

          <p className="text-[11px] text-center text-gray-500 mt-2">
            {process.env.NEXT_PUBLIC_BACKEND_URL
              ? `API: ${process.env.NEXT_PUBLIC_BACKEND_URL}`
              : 'API: no configurada (NEXT_PUBLIC_BACKEND_URL)'}
          </p>
        </form>
      </div>
    </main>
  );
}

