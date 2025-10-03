"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // Protección adicional en cliente (middleware ya bloquea en servidor)
    const hasToken = document.cookie.split("; ").some(c => c.startsWith("konyx_token="));
    if (!hasToken) router.replace("/");
  }, [router]);

  function logout() {
    document.cookie = "konyx_token=; Path=/; Max-Age=0; SameSite=Lax";
    router.push("/");
  }

  return (
    <main
      className="min-h-screen bg-no-repeat bg-center bg-cover p-6"
      style={{ backgroundImage: 'url(/fondo.png)' }}
    >
      <div className="max-w-6xl mx-auto grid grid-cols-12 gap-6">
        {/* Columna izquierda: menú */}
        <aside className="col-span-12 md:col-span-4 lg:col-span-3 bg-white/80 backdrop-blur rounded-2xl shadow p-4 space-y-3">
          <h2 className="text-lg font-semibold mb-2">Menú</h2>
          <nav className="flex flex-col gap-2">
            <a className="px-3 py-2 rounded hover:bg-indigo-50" href="#empresa">Empresa</a>
            <a className="px-3 py-2 rounded hover:bg-indigo-50" href="#fecha">Fecha Factura</a>
            <a className="px-3 py-2 rounded hover:bg-indigo-50" href="#proyecto">Proyecto</a>
            <a className="px-3 py-2 rounded hover:bg-indigo-50" href="#cuenta">Cuenta Contable</a>
            <a className="px-3 py-2 rounded hover:bg-indigo-50" href="#config">Configuración</a>
            <button onClick={logout} className="text-left px-3 py-2 rounded hover:bg-red-50 text-red-600">
              Cerrar sesión
            </button>
          </nav>
        </aside>

        {/* Contenido derecha */}
        <section className="col-span-12 md:col-span-8 lg:col-span-9 space-y-6">
          <div id="empresa" className="bg-white/80 backdrop-blur rounded-2xl shadow p-4">
            <h3 className="font-semibold mb-2">Empresa seleccionada</h3>
            <p className="text-sm text-gray-600">Aquí mostrarás la empresa actual…</p>
          </div>
          <div id="fecha" className="bg-white/80 backdrop-blur rounded-2xl shadow p-4">
            <h3 className="font-semibold mb-2">Fecha factura</h3>
            <p className="text-sm text-gray-600">Selector/estado de fecha…</p>
          </div>
          <div id="proyecto" className="bg-white/80 backdrop-blur rounded-2xl shadow p-4">
            <h3 className="font-semibold mb-2">Proyecto</h3>
            <p className="text-sm text-gray-600">Proyecto actual…</p>
          </div>
          <div id="cuenta" className="bg-white/80 backdrop-blur rounded-2xl shadow p-4">
            <h3 className="font-semibold mb-2">Cuenta contable</h3>
            <p className="text-sm text-gray-600">Cuenta/plan contable…</p>
          </div>
          <div id="config" className="bg-white/80 backdrop-blur rounded-2xl shadow p-4">
            <h3 className="font-semibold mb-2">Configuración</h3>
            <p className="text-sm text-gray-600">Preferencias…</p>
          </div>
        </section>
      </div>
    </main>
  );
}

