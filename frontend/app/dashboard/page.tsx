"use client";

import { useState } from "react";

// Fuerza render dinámico (evita prerender/SSG)
export const dynamic = "force-dynamic";

type Parametro = "empresa" | "fecha" | "proyecto" | "cuenta" | "config";

export default function DashboardPage() {
  const [sel, setSel] = useState<Parametro>("empresa");

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Lateral izquierdo con menú + contenido del seleccionado */}
      <aside className="w-full max-w-xl bg-white shadow-sm border-r border-gray-100 p-6">
        <h1 className="text-xl font-semibold mb-4">Panel</h1>

        <nav className="grid grid-cols-2 gap-2 mb-6">
          <button
            onClick={() => setSel("empresa")}
            className={`px-3 py-2 rounded-lg border text-left ${
              sel === "empresa"
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            Empresa seleccionada
          </button>
          <button
            onClick={() => setSel("fecha")}
            className={`px-3 py-2 rounded-lg border text-left ${
              sel === "fecha"
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            Fecha factura
          </button>
          <button
            onClick={() => setSel("proyecto")}
            className={`px-3 py-2 rounded-lg border text-left ${
              sel === "proyecto"
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            Proyecto
          </button>
          <button
            onClick={() => setSel("cuenta")}
            className={`px-3 py-2 rounded-lg border text-left ${
              sel === "cuenta"
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            Cuenta contable
          </button>
          <button
            onClick={() => setSel("config")}
            className={`px-3 py-2 rounded-lg border text-left col-span-2 ${
              sel === "config"
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            Configuración
          </button>
        </nav>

        {/* Contenido del parámetro seleccionado */}
        <section className="rounded-xl border border-gray-200 p-4">
          {sel === "empresa" && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Empresa seleccionada</h2>
              <p className="text-sm text-gray-600">
                Aquí mostraremos la empresa activa y un selector para cambiarla.
              </p>
            </div>
          )}
          {sel === "fecha" && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Fecha factura</h2>
              <p className="text-sm text-gray-600">
                Configura el rango de fechas por defecto para emisión/recepción.
              </p>
            </div>
          )}
          {sel === "proyecto" && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Proyecto</h2>
              <p className="text-sm text-gray-600">
                Selección y filtros de proyecto asociados a la empresa.
              </p>
            </div>
          )}
          {sel === "cuenta" && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Cuenta contable</h2>
              <p className="text-sm text-gray-600">
                Mapea conceptos a cuentas contables y valida su formato.
              </p>
            </div>
          )}
          {sel === "config" && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Configuración</h2>
              <p className="text-sm text-gray-600">
                Preferencias generales de la app (idioma, tema, API, etc.).
              </p>
            </div>
          )}
        </section>
      </aside>

      {/* Área derecha libre (futuro contenido) */}
      <main className="flex-1 p-8">
        {/* Espacio para listados, gráficos, resultados, etc. */}
      </main>
    </div>
  );
}
