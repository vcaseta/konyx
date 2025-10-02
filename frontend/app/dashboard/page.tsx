"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type TabKey = "empresa" | "fecha" | "proyecto" | "cuenta" | "config";

export default function DashboardPage() {
  const router = useRouter();

  // Guard: requiere token para entrar
  useEffect(() => {
    const t = localStorage.getItem("konyx_token");
    if (!t) router.replace("/");
  }, [router]);

  // Tabs
  const [tab, setTab] = useState<TabKey>("empresa");

  // Estado simple de cada panel
  const [empresaId, setEmpresaId] = useState<string>("");
  const [fechaFactura, setFechaFactura] = useState<string>("");
  const [proyecto, setProyecto] = useState<string>("");
  const [cuenta, setCuenta] = useState<string>("");

  // Cargar empresas desde env público (string JSON)
  const companies = useMemo(() => {
    try {
      return JSON.parse(process.env.NEXT_PUBLIC_COMPANIES || "[]") as {
        id: string;
        name: string;
      }[];
    } catch {
      return [];
    }
  }, []);

  // UI helpers
  const isActive = (k: TabKey) =>
    tab === k ? "bg-indigo-600 text-white" : "hover:bg-indigo-50 text-gray-800";

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Barra superior */}
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Konyx" className="h-8 w-auto" />
            <span className="text-sm text-gray-500">Panel</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/")}
              className="text-sm text-gray-600 hover:text-gray-900"
              title="Volver al inicio de sesión"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* Layout principal */}
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Sidebar izquierda */}
        <aside className="md:col-span-4 lg:col-span-3">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700">
                Parámetros
              </h2>
            </div>

            <nav className="p-2 flex flex-col">
              <button
                onClick={() => setTab("empresa")}
                className={`text-left w-full px-3 py-2 rounded-lg ${isActive(
                  "empresa"
                )}`}
              >
                Empresa seleccionada
                <div className="text-xs opacity-80">
                  {empresaId
                    ? companies.find((c) => c.id === empresaId)?.name ||
                      `ID: ${empresaId}`
                    : "— no seleccionada —"}
                </div>
              </button>

              <button
                onClick={() => setTab("fecha")}
                className={`text-left w-full px-3 py-2 rounded-lg ${isActive(
                  "fecha"
                )}`}
              >
                Fecha factura
                <div className="text-xs opacity-80">
                  {fechaFactura || "— sin fecha —"}
                </div>
              </button>

              <button
                onClick={() => setTab("proyecto")}
                className={`text-left w-full px-3 py-2 rounded-lg ${isActive(
                  "proyecto"
                )}`}
              >
                Proyecto
                <div className="text-xs opacity-80">
                  {proyecto || "— sin proyecto —"}
                </div>
              </button>

              <button
                onClick={() => setTab("cuenta")}
                className={`text-left w-full px-3 py-2 rounded-lg ${isActive(
                  "cuenta"
                )}`}
              >
                Cuenta contable
                <div className="text-xs opacity-80">
                  {cuenta || "— sin cuenta —"}
                </div>
              </button>

              <button
                onClick={() => setTab("config")}
                className={`text-left w-full px-3 py-2 rounded-lg ${isActive(
                  "config"
                )}`}
              >
                Configuración
                <div className="text-xs opacity-80">Preferencias</div>
              </button>
            </nav>
          </div>
        </aside>

        {/* Contenido derecha */}
        <section className="md:col-span-8 lg:col-span-9">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-800 capitalize">
                {tab === "empresa" && "Empresa seleccionada"}
                {tab === "fecha" && "Fecha factura"}
                {tab === "proyecto" && "Proyecto"}
                {tab === "cuenta" && "Cuenta contable"}
                {tab === "config" && "Configuración"}
              </h3>
            </div>

            <div className="p-5">
              {/* Panel: Empresa */}
              {tab === "empresa" && (
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Selecciona una empresa
                  </label>
                  <select
                    value={empresaId}
                    onChange={(e) => setEmpresaId(e.target.value)}
                    className="w-full max-w-md rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="">— Elegir —</option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>

                  {empresaId && (
                    <div className="text-sm text-gray-600">
                      Empresa activa:{" "}
                      <span className="font-medium">
                        {companies.find((c) => c.id === empresaId)?.name}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Panel: Fecha */}
              {tab === "fecha" && (
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Fecha de la factura
                  </label>
                  <input
                    type="date"
                    value={fechaFactura}
                    onChange={(e) => setFechaFactura(e.target.value)}
                    className="w-full max-w-md rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                  {fechaFactura && (
                    <p className="text-sm text-gray-600">
                      Seleccionada:{" "}
                      <span className="font-medium">{fechaFactura}</span>
                    </p>
                  )}
                </div>
              )}

              {/* Panel: Proyecto */}
              {tab === "proyecto" && (
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Proyecto
                  </label>
                  <input
                    type="text"
                    value={proyecto}
                    onChange={(e) => setProyecto(e.target.value)}
                    placeholder="Ej. Website corporativo"
                    className="w-full max-w-md rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                  {proyecto && (
                    <p className="text-sm text-gray-600">
                      Proyecto: <span className="font-medium">{proyecto}</span>
                    </p>
                  )}
                </div>
              )}

              {/* Panel: Cuenta contable */}
              {tab === "cuenta" && (
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Cuenta contable
                  </label>
                  <input
                    type="text"
                    value={cuenta}
                    onChange={(e) => setCuenta(e.target.value)}
                    placeholder="Ej. 700000 Ventas"
                    className="w-full max-w-md rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                  {cuenta && (
                    <p className="text-sm text-gray-600">
                      Cuenta: <span className="font-medium">{cuenta}</span>
                    </p>
                  )}
                </div>
              )}

              {/* Panel: Configuración */}
              {tab === "config" && (
                <div className="space-y-5">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800">
                      Preferencias de interfaz
                    </h4>
                    <p className="text-sm text-gray-500">
                      (Pendiente) Aquí podrás ajustar tema, idioma, etc.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      className="rounded-lg bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-700"
                      onClick={() => alert("Guardado (demo)")}
                    >
                      Guardar
                    </button>
                    <button
                      className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50"
                      onClick={() => alert("Restaurado (demo)")}
                    >
                      Restaurar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

    </div>
  );
}
