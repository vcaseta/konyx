'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type Company = { id: string; name: string };

function readCompanies(): Company[] {
  try {
    const raw = process.env.NEXT_PUBLIC_COMPANIES;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as Company[];
    }
  } catch { /* ignore */ }
  // Fallback si no hay env
  return [
    { id: 'empresa1', name: 'Empresa 1' },
    { id: 'empresa2', name: 'Empresa 2' },
  ];
}

export default function DashboardPage() {
  const router = useRouter();
  const [tokenChecked, setTokenChecked] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const companies = useMemo(readCompanies, []);

  // Comprobar token: si no existe, volver al login
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('konyx_token') : null;
    if (!token) {
      router.replace('/');
    } else {
      // Cargar selección previa de empresa (si existe)
      const prev = localStorage.getItem('konyx_company');
      if (prev) setSelected(prev);
      setTokenChecked(true);
    }
  }, [router]);

  const saveAndContinue = () => {
    if (!selected) return;
    localStorage.setItem('konyx_company', selected);
    // Aquí ya podrías redirigir a /invoices, /contacts, etc.
    // De momento, mostramos un pequeño aviso/placeholder.
    alert(`Empresa activa: ${selected}. A continuación implementamos menús y pantallas.`);
  };

  const logout = () => {
    localStorage.removeItem('konyx_token');
    localStorage.removeItem('konyx_company');
    router.replace('/');
  };

  if (!tokenChecked) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-gray-500">Cargando…</p>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen bg-cover bg-center bg-no-repeat p-6"
      style={{ backgroundImage: 'url(/fondo.png)' }}
    >
      <div className="max-w-3xl mx-auto">
        {/* Cabecera con logo grande */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <img src="/logo.png" alt="Konyx" className="h-20 md:h-24 w-auto drop-shadow-md" />
          <h1 className="text-white text-2xl md:text-3xl font-semibold drop-shadow">
            Bienvenido a Konyx
          </h1>
          <p className="text-white/90 drop-shadow">
            Selecciona la empresa con la que deseas trabajar
          </p>
        </div>

        {/* Tarjeta de selección */}
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-lg p-6">
          <div className="grid md:grid-cols-2 gap-4">
            {companies.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelected(c.id)}
                className={`rounded-xl border p-4 text-left transition
                  ${selected === c.id ? 'border-indigo-600 ring-2 ring-indigo-200' : 'hover:border-gray-400'}
                `}
              >
                <div className="font-semibold">{c.name}</div>
                <div className="text-xs text-gray-500 mt-1">ID: {c.id}</div>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between mt-6">
            <button
              onClick={logout}
              className="rounded-lg border px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              Cerrar sesión
            </button>

            <button
              onClick={saveAndContinue}
              disabled={!selected}
              className="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 font-medium disabled:opacity-60"
            >
              Continuar
            </button>
          </div>

          {/* Pista de la selección actual */}
          <p className="text-[11px] text-gray-500 mt-3">
            {selected ? `Seleccionado: ${selected}` : 'Ninguna empresa seleccionada'}
          </p>
        </div>
      </div>
    </main>
  );
}
