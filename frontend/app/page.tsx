'use client';

import { useCallback, useEffect, useState } from 'react';
import Login from './components/Login';
// Si ya tienes un Logo.tsx y quieres mostrarlo, descomenta la siguiente línea:
// import Logo from './components/Logo';

export default function Page() {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Al cargar, intenta recuperar token guardado (si lo usas en localStorage)
  useEffect(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('konyx_token') : null;
      if (saved) setToken(saved);
    } catch {
      /* noop */
    }
  }, []);

  const onLogin = useCallback((newToken: string) => {
    setToken(newToken);
    try {
      localStorage.setItem('konyx_token', newToken);
    } catch {
      /* noop */
    }
  }, []);

  const handleSubmit = useCallback(
    async (user: string, pass: string) => {
      setError(null);
      setLoading(true);
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!baseUrl) throw new Error('Falta configurar NEXT_PUBLIC_API_URL');

        const res = await fetch(`${baseUrl}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user, pass }),
        });

        if (!res.ok) {
          // Intenta leer mensaje del backend
          let msg = 'Credenciales inválidas';
          try {
            const data = await res.json();
            if (data?.message) msg = data.message;
          } catch {
            /* noop */
          }
          throw new Error(msg);
        }

        const data = await res.json();
        if (!data?.token) throw new Error('El backend no devolvió token');

        onLogin(data.token);
      } catch (e: any) {
        setError(e?.message ?? 'Error de autenticación');
      } finally {
        setLoading(false);
      }
    },
    [onLogin]
  );

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="mx-auto max-w-5xl px-6 py-8 flex items-center gap-4">
        {/* Si tienes el componente Logo, descomenta: */}
        {/* <Logo /> */}
        <div>
          <h1 className="text-2xl font-bold">Konyx</h1>
          <p className="text-sm text-gray-500">Gestión de facturación con Holded</p>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 pb-12">
        {!token ? (
          <section className="bg-white rounded-2xl p-6 shadow">
            <h2 className="text-lg font-semibold">Acceso</h2>
            <p className="text-sm text-gray-500">
              Introduce tus credenciales para acceder al panel.
            </p>

            {error && (
              <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex justify-center">
              <div className="w-full max-w-sm">
                <Login onSubmit={handleSubmit} />
                {loading && (
                  <p className="mt-3 text-center text-sm text-gray-500">Validando...</p>
                )}
              </div>
            </div>
          </section>
        ) : (
          <section className="bg-white rounded-2xl p-6 shadow space-y-4">
            <h2 className="text-lg font-semibold mb-2">Konyx</h2>
            <p className="text-gray-600">
              Sesión iniciada. Ya puedes importar sesiones y generar borradores en Holded.
            </p>

            <div className="flex gap-2">
              <button
                className="rounded-md bg-gray-100 px-3 py-2 text-sm hover:bg-gray-200"
                onClick={() => window.location.reload()}
              >
                Refrescar
              </button>
              <button
                className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
                onClick={() => {
                  try { localStorage.removeItem('konyx_token'); } catch { /* noop */ }
                  setToken(null);
                }}
              >
                Cerrar sesión
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
