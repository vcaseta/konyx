'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Logo from './components/Logo';
import Login from './components/Login';

export default function Page() {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL as string;
  const [token, setToken] = useState<string | null>(null);
  const [apiOk, setApiOk] = useState<boolean | null>(null);

  useEffect(() => {
    const t = localStorage.getItem('konyx_token');
    if (t) setToken(t);
    (async () => {
      try {
        await axios.get(`${backend}/ping`);
        setApiOk(true);
      } catch {
        setApiOk(false);
      }
    })();
  }, [backend]);

  function onLogin(t: string) {
    localStorage.setItem('konyx_token', t);
    setToken(t);
  }
  function logout() {
    localStorage.removeItem('konyx_token');
    setToken(null);
  }

  return (
    <main className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 pt-10 pb-20">
        <div className="flex items-center justify-between mb-8">
          <Logo />
          {token && <button onClick={logout} className="text-sm text-slate-600 hover:text-slate-800">Salir</button>}
        </div>

        {apiOk === false && (
          <div className="mb-6 p-3 rounded bg-red-50 border border-red-200 text-sm text-red-700">
            No puedo contactar con el backend en <b>{backend}</b>. Revisa <code>NEXT_PUBLIC_BACKEND_URL</code> y el contenedor del backend.
          </div>
        )}

        {!token ? (
          <div className="flex justify-center"><Login onOk={onLogin} /></div>
        ) : (
          <section className="bg-white rounded-2xl p-6 shadow">
            <h2 className="text-lg font-semibold mb-2">Konyx</h2>
            <p className="text-slate-600">Login correcto. (Aquí añadiremos el importador de sesiones y creación de facturas)</p>
          </section>
        )}

        <footer className="mt-10 text-center text-xs text-slate-500">© {new Date().getFullYear()} Konyx</footer>
      </div>
    </main>
  );
}
