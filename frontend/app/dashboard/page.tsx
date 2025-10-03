// app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type SectionKey = "empresa" | "fecha" | "proyecto" | "cuenta" | "config";

const SECTIONS: { key: SectionKey; label: string }[] = [
  { key: "empresa", label: "Empresa seleccionada" },
  { key: "fecha", label: "Fecha factura" },
  { key: "proyecto", label: "Proyecto" },
  { key: "cuenta", label: "Cuenta contable" },
  { key: "config", label: "Configuración" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [active, setActive] = useState<SectionKey>("empresa");

  // Doble protección en cliente (además del middleware del servidor)
  useEffect(() => {
    const hasToken = document.cookie.split("; ").some(c => c.startsWith("konyx_token="));
    if (!hasToken) router.replace("/");
  }, [router]);

  function logout() {
    document.cookie =
      "konyx_token=; Path=/; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
    router.replace("/");
  }

  return (
    <main
      className="min-h-screen bg-no-repeat bg-center bg-cover"
      style={{
        backgroundImage: "url(/fondo.png)",
        backgroundSize: "100% 100%",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Top bar minimal con logout */}
      <header className="px-4 py-3 flex items-center justify-end">
        <button
          onClick={logout}
          className="rounded-lg bg-white/80 backdrop-blur px-4 py-2 text-sm font-medium shadow hover:bg-white/90 border border-white/60"
        >
          Cerrar sesión
        </button>
      </header>

      {/* Layout sin márgenes laterales para que el panel quede pegado a la izquierda */}
      <div className="mx-0 px-0">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* PANEL IZQUIERDO */}
          <aside className="md:col-span-4 md:pl-0">
            <div className="bg-white/85 backdrop-blur rounded-r-2xl rounded-l-none md:rounded-l-2xl md:ml-0 shadow p-4 md:min-h-[70vh]">
              {/* Logo dentro del panel: h-24 = 96px */}
              <div className="flex items-center gap-3 mb-4">
                <img src="/logo.png" alt="Konyx" className="h-24 w-auto drop-shadow-md" />
              </div>

              <h2 className="text-lg font-semibold mb-3">Panel</h2>
              <nav className="space-y-2">
                {SECTIONS.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setActive(s.key)}
                    className={`w-full text-left rounded-xl px-3 py-2 border transition
                    ${
                      active === s.key
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white/70 hover:bg-white/90 border-gray-200"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}

                <div className="pt-2 mt-2 border-t border-gray-200/70">
                  <button
                    onClick={logout}
                    className="w-full text-left rounded-xl px-3 py-2 border bg-white/70 hover:bg-white/90 border-gray-200 text-red-600 font-medium"
                  >
                    Cerrar sesión
                  </button>
                </div>
              </nav>
            </div>
          </aside>

          {/* CONTENIDO DERECHO */}
          <section className="md:col-span-8 px-4 md:px-0">
            <div className="bg-white/90 backdrop-blur rounded-2xl shadow p-6 md:mr-6">
              {active === "empresa" && <EmpresaView />}
              {active === "fecha" && <FechaView />}
              {active === "proyecto" && <ProyectoView />}
              {active === "cuenta" && <CuentaView />}
              {active === "config" && <ConfigView />}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

/* ======= VISTAS ======= */

function EmpresaView() {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Empresa seleccionada</h3>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Empresa</label>
          <select className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
            <option value="001">Kissoro</option>
            <option value="002">En Plural Psicología</option>
          </select>
        </div>
        <p className="text-sm text-gray-600">
          Selecciona la empresa con la que quieres trabajar. Esta selección se aplicará al resto de secciones.
        </p>
      </div>
    </div>
  );
}

function FechaView() {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Fecha factura</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Fecha inicio</label>
          <input
            type="date"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Fecha fin</label>
          <input
            type="date"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
        </div>
      </div>
      <p className="text-sm text-gray-600 mt-3">
        Define el rango para filtrar las facturas que quieres consultar o procesar.
      </p>
    </div>
  );
}

function ProyectoView() {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Proyecto</h3>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Proyecto</label>
          <input
            type="text"
            placeholder="Código o nombre de proyecto"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
        </div>
        <p className="text-sm text-gray-600">
          Indica el proyecto relacionado con las facturas a gestionar.
        </p>
      </div>
    </div>
  );
}

function CuentaView() {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Cuenta contable</h3>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Cuenta</label>
          <input
            type="text"
            placeholder="Ej. 700000 Ventas"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
        </div>
        <p className="text-sm text-gray-600">
          Ajusta la cuenta contable por defecto para las operaciones del proyecto/empresa seleccionada.
        </p>
      </div>
    </div>
  );
}

function ConfigView() {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Configuración</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm">Validación estricta</span>
          <input type="checkbox" className="h-5 w-5" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Notas</label>
          <textarea
            rows={4}
            placeholder="Notas o preferencias…"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
        </div>
      </div>
    </div>
  );
}


  );
}

