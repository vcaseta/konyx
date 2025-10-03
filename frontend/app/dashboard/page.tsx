// app/dashboard/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type MenuKey =
  | "empresa"
  | "fecha"
  | "proyecto"
  | "cuenta"
  | "config"
  | "logout";

const MENU: { key: MenuKey; label: string }[] = [
  { key: "empresa", label: "Empresa" },
  { key: "fecha", label: "Fecha Factura" },
  { key: "proyecto", label: "Proyecto" },
  { key: "cuenta", label: "Cuenta Contable" },
  { key: "config", label: "Configuración" },
  { key: "logout", label: "Cerrar Sesión" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [active, setActive] = useState<MenuKey>("empresa");

  function onSelect(key: MenuKey) {
    if (key === "logout") {
      // No persistimos sesión, simplemente volvemos al login
      router.push("/");
      return;
    }
    setActive(key);
  }

  return (
    <main
      className="min-h-screen bg-no-repeat bg-center bg-cover"
      style={{
        backgroundImage: "url(/fondo.png)",
        backgroundSize: "100% 100%",
      }}
    >
      {/* Capa de contenido */}
      <div className="min-h-screen bg-black/0 flex items-stretch">
        {/* Sidebar */}
        <aside className="w-full max-w-xs bg-white/90 backdrop-blur border-r border-black/5">
          {/* Logo arriba (opcional) */}
          <div className="p-6 border-b border-black/5">
            <div className="flex items-center justify-center">
              <img src="/logo.png" alt="Konyx" className="h-64 w-auto" />
            </div>
          </div>

          {/* Menú */}
          <nav className="p-3">
            <ul className="space-y-1">
              {MENU.map((item) => (
                <li key={item.key}>
                  <button
                    onClick={() => onSelect(item.key)}
                    className={[
                      "w-full text-left px-4 py-2 rounded-lg transition",
                      active === item.key
                        ? "bg-indigo-600 text-white"
                        : "hover:bg-black/5 text-gray-800",
                    ].join(" ")}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Contenido principal */}
        <section className="flex-1 p-6 md:p-10">
          <div className="max-w-5xl mx-auto">
            {/* Título según sección */}
            <h1 className="text-2xl font-semibold mb-4 text-white drop-shadow">
              {labelFor(active)}
            </h1>

            {/* Tarjeta de contenido (limpia, semi-transparente) */}
            <div className="bg-white/90 backdrop-blur rounded-2xl shadow p-6">
              {renderContent(active)}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function labelFor(key: MenuKey) {
  switch (key) {
    case "empresa":
      return "Empresa seleccionada";
    case "fecha":
      return "Fecha de la factura";
    case "proyecto":
      return "Proyecto";
    case "cuenta":
      return "Cuenta contable";
    case "config":
      return "Configuración";
    case "logout":
      return "Saliendo…";
  }
}

function renderContent(key: MenuKey) {
  switch (key) {
    case "empresa":
      return (
        <div className="space-y-4">
          <p className="text-gray-700">
            Selecciona la empresa con la que vas a trabajar.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <select className="w-full rounded-lg border border-gray-300 px-3 py-2">
              <option value="">— Elegir empresa —</option>
              <option value="001">Kissoro</option>
              <option value="002">En Plural Psicología</option>
            </select>

            <div className="rounded-lg border border-gray-200 p-3">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Actual:</span> (sin seleccionar)
              </p>
            </div>
          </div>
        </div>
      );

    case "fecha":
      return (
        <div className="space-y-4">
          <p className="text-gray-700">
            Indica la fecha de la factura para filtrar y organizar registros.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="date"
              className="rounded-lg border border-gray-300 px-3 py-2"
            />
            <button className="rounded-lg bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-700">
              Aplicar
            </button>
          </div>
        </div>
      );

    case "proyecto":
      return (
        <div className="space-y-4">
          <p className="text-gray-700">
            Selecciona el proyecto asociado a las facturas.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <select className="w-full rounded-lg border border-gray-300 px-3 py-2">
              <option value="">— Elegir proyecto —</option>
              <option value="P-001">Proyecto A</option>
              <option value="P-002">Proyecto B</option>
            </select>

            <div className="rounded-lg border border-gray-200 p-3">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Detalle:</span> (sin seleccionar)
              </p>
            </div>
          </div>
        </div>
      );

    case "cuenta":
      return (
        <div className="space-y-4">
          <p className="text-gray-700">
            Indica la cuenta contable a utilizar por defecto.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="text"
              placeholder="Ej. 700 Ventas"
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
            <button className="rounded-lg bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-700">
              Guardar
            </button>
          </div>
        </div>
      );

    case "config":
      return (
        <div className="space-y-4">
          <p className="text-gray-700">
            Preferencias generales de Konyx para esta sesión.
          </p>
          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="size-4" />
              <span className="text-gray-700 text-sm">Modo detallado</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="size-4" />
              <span className="text-gray-700 text-sm">Confirmar al guardar</span>
            </label>
          </div>
          <button className="rounded-lg bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-700">
            Aplicar cambios
          </button>
        </div>
      );

    case "logout":
      return (
        <div className="space-y-2">
          <p className="text-gray-700">Redirigiendo al inicio de sesión…</p>
        </div>
      );
  }
}

