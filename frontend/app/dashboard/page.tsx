// app/dashboard/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const hasToken = document.cookie.split("; ").some(c => c.startsWith("konyx_token="));
    if (!hasToken) router.replace("/");
  }, [router]);

  function logout() {
    document.cookie = "konyx_token=; Path=/; Max-Age=0; SameSite=Lax";
    router.push("/");
  }

  return (
    <main
      className="min-h-screen bg-no-repeat bg-center bg-cover flex items-center justify-start p-8"
      style={{ backgroundImage: 'url(/fondo.png)' }}
    >
      {/* Columna izquierda con menú y contenido */}
      <aside className="w-80 bg-white/85 backdrop-blur rounded-2xl shadow-xl p-6 space-y-4">
        <h2 className="text-xl font-semibold mb-4">Panel de Control</h2>
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

        <div className="mt-6 space-y-3 text-sm text-gray-700">
          <div id="empresa">
            <p><strong>Empresa seleccionada:</strong> —</p>
          </div>
          <div id="fecha">
            <p><strong>Fecha factura:</strong> —</p>
          </div>
          <div id="proyecto">
            <p><strong>Proyecto:</strong> —</p>
          </div>
          <div id="cuenta">
            <p><strong>Cuenta contable:</strong> —</p>
          </div>
          <div id="config">
            <p><strong>Configuración:</strong> —</p>
          </div>
        </div>
      </aside>
    </main>
  );
}

