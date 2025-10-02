"use client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);

  // Proteger ruta: si no hay token, volver al login
  useEffect(() => {
    const t = localStorage.getItem("konyx_token");
    if (!t) {
      router.replace("/");
      return;
    }
    setToken(t);
  }, [router]);

  function logout() {
    localStorage.removeItem("konyx_token");
    router.replace("/");
  }

  return (
    <main
      className="min-h-screen bg-no-repeat bg-center bg-cover p-6"
      style={{
        backgroundImage: "url(/fondo.png)",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between py-4">
          <img src="/logo.png" alt="Konyx" className="h-10 w-auto" />
          <button
            onClick={logout}
            className="text-sm px-3 py-1 rounded bg-gray-900/70 text-white hover:bg-gray-900"
          >
            Cerrar sesión
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {/* Panel izquierdo con parámetros */}
          <aside className="md:col-span-1 bg-white/90 backdrop-blur rounded-2xl shadow p-4">
            <h2 className="font-semibold mb-3">Parámetros</h2>
            <ul className="space-y-2 text-sm">
              <li>Empresa seleccionada</li>
              <li>Fecha factura</li>
              <li>Proyecto</li>
              <li>Cuenta contable</li>
              <li>Configuración</li>
            </ul>
          </aside>

          {/* Zona de contenido */}
          <section className="md:col-span-2 bg-white/90 backdrop-blur rounded-2xl shadow p-4">
            <h2 className="font-semibold mb-3">Contenido</h2>
            <p className="text-sm text-gray-700">
              Bienvenido al panel. Aquí mostraremos los detalles del parámetro seleccionado.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
