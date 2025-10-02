"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type TabKey =
  | "empresa"
  | "fecha"
  | "proyecto"
  | "cuenta"
  | "config";

const TABS: { key: TabKey; label: string }[] = [
  { key: "empresa", label: "Empresa seleccionada" },
  { key: "fecha", label: "Fecha factura" },
  { key: "proyecto", label: "Proyecto" },
  { key: "cuenta", label: "Cuenta contable" },
  { key: "config", label: "Configuración" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [active, setActive] = useState<TabKey>("empresa");

  // Guard sencillo: si no hay token, vuelve al login
  useEffect(() => {
    const t = localStorage.getItem("konyx_token");
    if (!t) router.replace("/");
  }, [router]);

  return (
    <main className="min-h-screen w-full bg-gray-50">
      {/* Barra superior mínima */}
      <header className="w-full border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Konyx" className="h-7 w-auto" />
            <span className="text-sm text-gray-400">Dashboard</span>
          </div>
          <div className="text-sm text-gray-500">
            Versión 1.0
          </div>
        </div>
      </header>

      {/* Contenido */}
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna izquierda: cuadro grande con menú + detalle del tab */}
          <section className="lg:col-span-2">
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
              {/* Menú horizontal (dentro del mismo cuadro) */}
              <nav className="w-full border-b bg-white/60 backdrop-blur">
                <ul className="flex flex-wrap">
                  {TABS.map((t) => (
                    <li key={t.key}>
                      <button
                        onClick={() => setActive(t.key)}
                        className={[
                          "px-4 sm:px-5 py-3 text-sm sm:text-[0.95rem] transition-colors",
                          active === t.key
                            ? "text-blue-700 border-b-2 border-blue-600"
                            : "text-gray-500 hover:text-gray-700"
                        ].join(" ")}
                      >
                        {t.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Contenido del tab seleccionado */}
              <div className="p-4 sm:p-6">
                {active === "empresa" && <EmpresaPanel />}
                {active === "fecha" && <FechaPanel />}
                {active === "proyecto" && <ProyectoPanel />}
                {active === "cuenta" && <CuentaPanel />}
                {active === "config" && <ConfigPanel />}
              </div>
            </div>
          </section>

          {/* Columna derecha: Resumen / Ayuda (opcional, para crecer) */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl border shadow-sm p-5">
              <h3 className="text-base font-semibold mb-2">Resumen</h3>
              <p className="text-sm text-gray-500 mb-4">
                Aquí puedes mostrar un resumen dinámico de la selección actual.
              </p>
              <ul className="text-sm space-y-2">
                <li className="flex items-center justify-between">
                  <span className="text-gray-500">Pestaña activa</span>
                  <span className="font-medium">
                    {TABS.find((t) => t.key === active)?.label}
                  </span>
                </li>
                {/* Más líneas de resumen si lo deseas */}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

/* --------- Panels (contenido de cada parámetro) --------- */

function EmpresaPanel() {
  // TODO: alimentar con /companies cuando esté listo
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Empresa seleccionada</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="border rounded-xl p-4">
          <label className="text-sm text-gray-600">Empresa</label>
          <select className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600">
            <option value="001">Kissoro</option>
            <option value="002">En Plural Psicología</option>
          </select>
        </div>
        <div className="border rounded-xl p-4">
          <label className="text-sm text-gray-600">API Holded</label>
          <select className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600">
            <option>Producción</option>
            <option>Sandbox</option>
          </select>
        </div>
      </div>
      <div className="flex gap-3">
        <button className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
          Guardar
        </button>
        <button className="px-4 py-2 rounded-lg border hover:bg-gray-50">
          Cancelar
        </button>
      </div>
    </div>
  );
}

function FechaPanel() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Fecha de factura</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="border rounded-xl p-4">
          <label className="text-sm text-gray-600">Desde</label>
          <input
            type="date"
            className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
        <div className="border rounded-xl p-4">
          <label className="text-sm text-gray-600">Hasta</label>
          <input
            type="date"
            className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
      </div>
      <button className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
        Aplicar rango
      </button>
    </div>
  );
}

function ProyectoPanel() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Proyecto</h2>
      <div className="border rounded-xl p-4">
        <label className="text-sm text-gray-600">Buscar / Seleccionar</label>
        <input
          type="text"
          placeholder="Nombre o código de proyecto…"
          className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="border rounded-xl p-4">
          <p className="text-sm text-gray-600">Proyecto actual</p>
          <p className="mt-1 font-medium">—</p>
        </div>
        <div className="border rounded-xl p-4">
          <p className="text-sm text-gray-600">Estado</p>
          <p className="mt-1 font-medium">—</p>
        </div>
      </div>
      <button className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
        Guardar proyecto
      </button>
    </div>
  );
}

function CuentaPanel() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Cuenta contable</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="border rounded-xl p-4">
          <label className="text-sm text-gray-600">Cuenta</label>
          <input
            type="text"
            placeholder="430000, 700000, etc."
            className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
        <div className="border rounded-xl p-4">
          <label className="text-sm text-gray-600">Descripción</label>
          <input
            type="text"
            placeholder="Clientes, Ventas…"
            className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
      </div>
      <div className="flex gap-3">
        <button className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
          Guardar cuenta
        </button>
        <button className="px-4 py-2 rounded-lg border hover:bg-gray-50">
          Limpiar
        </button>
      </div>
    </div>
  );
}

function ConfigPanel() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Configuración</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="border rounded-xl p-4">
          <label className="text-sm text-gray-600">Moneda</label>
          <select className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600">
            <option>EUR</option>
            <option>USD</option>
          </select>
        </div>
        <div className="border rounded-xl p-4">
          <label className="text-sm text-gray-600">Impuestos</label>
          <select className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600">
            <option>21%</option>
            <option>10%</option>
            <option>0%</option>
          </select>
        </div>
      </div>
      <button className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
        Guardar configuración
      </button>
    </div>
  );
}
