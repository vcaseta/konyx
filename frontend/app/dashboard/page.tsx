// app/dashboard/page.tsx
"use client";

import { useState, useRef, ChangeEvent } from "react";
import { useRouter } from "next/navigation";

type MenuKey =
  | "formato-import"
  | "formato-export"
  | "empresa"
  | "fecha"
  | "proyecto"
  | "cuenta"
  | "fichero"
  | "config"
  | "logout";

type ConfigTab = "password" | "apis" | "formatos";

export default function DashboardPage() {
  const router = useRouter();

  // ---- Estado de selección ----
  const [active, setActive] = useState<MenuKey>("empresa");

  const [formatoImport, setFormatoImport] = useState<"Eholo" | "Gestoria">(
    "Eholo"
  );
  const [formatoExport, setFormatoExport] = useState<"Holded" | "Gestoria">(
    "Holded"
  );

  const empresas = ["Kissoro", "En Plural Psicologia"] as const;
  const [empresaSel, setEmpresaSel] =
    useState<(typeof empresas)[number]>("Kissoro");

  const [fecha, setFecha] = useState<string>("");

  const proyectos = [
    "Servicios de Psicologia",
    "Formacion",
    "Administracion SL",
  ] as const;
  const [proyectoSel, setProyectoSel] =
    useState<(typeof proyectos)[number]>("Servicios de Psicologia");

  const cuentas = [
    "70500000 Prestaciones de servicios",
    "70000000 Venta de mercaderías",
    "Otra (introducir)",
  ] as const;
  const [cuentaSel, setCuentaSel] =
    useState<(typeof cuentas)[number]>("70500000 Prestaciones de servicios");
  const [cuentaCustom, setCuentaCustom] = useState<string>("");

  const [fileName, setFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Config
  const [configTab, setConfigTab] = useState<ConfigTab>("password");
  const [newPass, setNewPass] = useState("");
  const [apiHoldedKissoro, setApiHoldedKissoro] = useState("");
  const [apiHoldedEnPlural, setApiHoldedEnPlural] = useState("");
  const [formatoExcelNotas, setFormatoExcelNotas] = useState("General");

  // ---- Acciones ----
  const onPickFile = () => fileInputRef.current?.click();

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    setFileName(f ? f.name : "");
  };

  const onCerrarSesion = () => {
    // Sin recordar sesión: simplemente volver a login
    router.push("/");
  };

  // ---- UI auxiliares ----
  const ActiveItem = ({ label }: { label: string }) => (
    <span className="inline-block rounded-lg bg-white/10 px-3 py-2 text-white/90 hover:bg-white/15 transition">
      {label}
    </span>
  );

  // ---- Contenidos centrales por menú ----
  const renderContent = () => {
    switch (active) {
      case "formato-import":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">
              Formato Importación
            </h2>
            <div className="grid gap-3">
              {(["Eholo", "Gestoria"] as const).map((opt) => (
                <label
                  key={opt}
                  className="flex items-center gap-3 bg-white/90 backdrop-blur rounded-xl p-3"
                >
                  <input
                    type="radio"
                    name="formatoImport"
                    value={opt}
                    checked={formatoImport === opt}
                    onChange={() => setFormatoImport(opt)}
                  />
                  <span className="font-medium">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case "formato-export":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">
              Formato Exportación
            </h2>
            <div className="grid gap-3">
              {(["Holded", "Gestoria"] as const).map((opt) => (
                <label
                  key={opt}
                  className="flex items-center gap-3 bg-white/90 backdrop-blur rounded-xl p-3"
                >
                  <input
                    type="radio"
                    name="formatoExport"
                    value={opt}
                    checked={formatoExport === opt}
                    onChange={() => setFormatoExport(opt)}
                  />
                  <span className="font-medium">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case "empresa":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Empresa</h2>
            <div className="grid gap-3">
              {empresas.map((e) => (
                <label
                  key={e}
                  className="flex items-center gap-3 bg-white/90 backdrop-blur rounded-xl p-3"
                >
                  <input
                    type="radio"
                    name="empresa"
                    value={e}
                    checked={empresaSel === e}
                    onChange={() => setEmpresaSel(e)}
                  />
                  <span className="font-medium">{e}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case "fecha":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Fecha factura</h2>
            <div className="bg-white/90 backdrop-blur rounded-xl p-4">
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </div>
          </div>
        );

      case "proyecto":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Proyecto</h2>
            <div className="grid gap-3">
              {proyectos.map((p) => (
                <label
                  key={p}
                  className="flex items-center gap-3 bg-white/90 backdrop-blur rounded-xl p-3"
                >
                  <input
                    type="radio"
                    name="proyecto"
                    value={p}
                    checked={proyectoSel === p}
                    onChange={() => setProyectoSel(p)}
                  />
                  <span className="font-medium">{p}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case "cuenta":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Cuenta contable</h2>
            <div className="grid gap-3">
              {cuentas.map((c) => (
                <label
                  key={c}
                  className="flex items-center gap-3 bg-white/90 backdrop-blur rounded-xl p-3"
                >
                  <input
                    type="radio"
                    name="cuenta"
                    value={c}
                    checked={cuentaSel === c}
                    onChange={() => setCuentaSel(c)}
                  />
                  <span className="font-medium">{c}</span>
                </label>
              ))}
              {cuentaSel === "Otra (introducir)" && (
                <div className="bg-white/90 backdrop-blur rounded-xl p-3">
                  <input
                    type="text"
                    placeholder="Introduce la cuenta contable..."
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    value={cuentaCustom}
                    onChange={(e) => setCuentaCustom(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>
        );

      case "fichero":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Fichero de datos</h2>
            <div className="bg-white/90 backdrop-blur rounded-xl p-4">
              <p className="text-sm text-gray-700 mb-3">
                Importa un fichero Excel desde tu equipo.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={onPickFile}
                  className="rounded-lg bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-700"
                >
                  Seleccionar fichero
                </button>
                <span className="text-sm text-gray-800">
                  {fileName || "Ningún fichero seleccionado"}
                </span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xls,.xlsx"
                className="hidden"
                onChange={onFileChange}
              />
            </div>
          </div>
        );

      case "config":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Configuración</h2>

            <div className="flex gap-2">
              {(["password", "apis", "formatos"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setConfigTab(tab)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                    configTab === tab
                      ? "bg-white/20 text-white"
                      : "bg-white/10 text-white/80 hover:bg-white/15"
                  }`}
                >
                  {tab === "password"
                    ? "Cambio de contraseña"
                    : tab === "apis"
                    ? "APIs"
                    : "Formatos Excel"}
                </button>
              ))}
            </div>

            {configTab === "password" && (
              <div className="bg-white/90 backdrop-blur rounded-xl p-4 space-y-3">
                <label className="block text-sm font-medium">Nueva contraseña</label>
                <input
                  type="password"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="••••••"
                />
                <button className="mt-2 rounded-lg bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-700">
                  Guardar
                </button>
              </div>
            )}

            {configTab === "apis" && (
              <div className="bg-white/90 backdrop-blur rounded-xl p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium">
                    API Holded Kissoro
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    value={apiHoldedKissoro}
                    onChange={(e) => setApiHoldedKissoro(e.target.value)}
                    placeholder="https://api.holded.com/..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">
                    API Holded En Plural Psicologia
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    value={apiHoldedEnPlural}
                    onChange={(e) => setApiHoldedEnPlural(e.target.value)}
                    placeholder="https://api.holded.com/..."
                  />
                </div>
                <button className="rounded-lg bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-700">
                  Guardar
                </button>
              </div>
            )}

            {configTab === "formatos" && (
              <div className="bg-white/90 backdrop-blur rounded-xl p-4 space-y-3">
                <label className="block text-sm font-medium">Formato Excel</label>
                <select
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  value={formatoExcelNotas}
                  onChange={(e) => setFormatoExcelNotas(e.target.value)}
                >
                  <option>General</option>
                  <option>Detalle</option>
                  <option>Simple</option>
                </select>
                <button className="mt-2 rounded-lg bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-700">
                  Guardar
                </button>
              </div>
            )}
          </div>
        );

      case "logout":
        // Mostramos confirmación simple aquí; al confirmar, ejecuta onCerrarSesion()
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Cerrar sesión</h2>
            <div className="bg-white/90 backdrop-blur rounded-xl p-4">
              <p className="mb-4 text-gray-800">¿Seguro que deseas salir?</p>
              <div className="flex gap-2">
                <button
                  onClick={onCerrarSesion}
                  className="rounded-lg bg-red-600 text-white px-4 py-2 hover:bg-red-700"
                >
                  Sí, cerrar
                </button>
                <button
                  onClick={() => setActive("empresa")}
                  className="rounded-lg bg-gray-200 text-gray-800 px-4 py-2 hover:bg-gray-300"
                >
                  No, volver
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  // Valor cuenta mostrado
  const cuentaMostrada =
    cuentaSel === "Otra (introducir)" && cuentaCustom.trim()
      ? cuentaCustom.trim()
      : cuentaSel;

  return (
    <main
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url(/fondo.png)" }}
    >
      <div className="min-h-screen bg-black/30">
        {/* Layout */}
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6">
            {/* Sidebar (más estrecho) */}
            <aside className="rounded-2xl bg-white/10 backdrop-blur p-4 md:p-5 shadow-lg">
              {/* Logo dentro del panel (altura 96) */}
              <div className="flex items-center gap-3 mb-6">
                <img src="/logo.png" alt="Konyx" className="h-24 w-auto" />
              </div>

              <nav className="space-y-1 text-white/90">
                <p className="px-2 text-xs uppercase tracking-wide text-white/60">
                  Dashboard
                </p>

                <button
                  onClick={() => setActive("formato-import")}
                  className={`w-full text-left px-3 py-2 rounded-lg transition ${
                    active === "formato-import"
                      ? "bg-white/20"
                      : "hover:bg-white/10"
                  }`}
                >
                  Formato Importación
                </button>
                <button
                  onClick={() => setActive("formato-export")}
                  className={`w-full text-left px-3 py-2 rounded-lg transition ${
                    active === "formato-export"
                      ? "bg-white/20"
                      : "hover:bg-white/10"
                  }`}
                >
                  Formato Exportación
                </button>

                <button
                  onClick={() => setActive("empresa")}
                  className={`w-full text-left px-3 py-2 rounded-lg transition ${
                    active === "empresa" ? "bg-white/20" : "hover:bg-white/10"
                  }`}
                >
                  Empresa (seleccionar)
                </button>

                <button
                  onClick={() => setActive("fecha")}
                  className={`w-full text-left px-3 py-2 rounded-lg transition ${
                    active === "fecha" ? "bg-white/20" : "hover:bg-white/10"
                  }`}
                >
                  Fecha factura
                </button>

                <button
                  onClick={() => setActive("proyecto")}
                  className={`w-full text-left px-3 py-2 rounded-lg transition ${
                    active === "proyecto" ? "bg-white/20" : "hover:bg-white/10"
                  }`}
                >
                  Proyecto
                </button>

                <button
                  onClick={() => setActive("cuenta")}
                  className={`w-full text-left px-3 py-2 rounded-lg transition ${
                    active === "cuenta" ? "bg-white/20" : "hover:bg-white/10"
                  }`}
                >
                  Cuenta contable
                </button>

                <button
                  onClick={() => setActive("fichero")}
                  className={`w-full text-left px-3 py-2 rounded-lg transition ${
                    active === "fichero" ? "bg-white/20" : "hover:bg-white/10"
                  }`}
                >
                  Fichero de datos
                </button>

                <button
                  onClick={() => setActive("config")}
                  className={`w-full text-left px-3 py-2 rounded-lg transition ${
                    active === "config" ? "bg-white/20" : "hover:bg-white/10"
                  }`}
                >
                  Configuración
                </button>

                <div className="pt-2">
                  <button
                    onClick={() => setActive("logout")}
                    className={`w-full text-left px-3 py-2 rounded-lg transition ${
                      active === "logout"
                        ? "bg-red-500/20 text-red-100"
                        : "hover:bg-red-500/10 text-red-200"
                    }`}
                  >
                    Cerrar sesión
                  </button>
                </div>
              </nav>
            </aside>

            {/* Contenido principal */}
            <section className="space-y-6">
              {/* Encabezado con “chips” del menú activo */}
              <div className="flex flex-wrap gap-2">
                <ActiveItem
                  label={
                    active === "formato-import"
                      ? `Formato Importación: ${formatoImport}`
                      : active === "formato-export"
                      ? `Formato Exportación: ${formatoExport}`
                      : active === "empresa"
                      ? `Empresa: ${empresaSel}`
                      : active === "fecha"
                      ? `Fecha factura`
                      : active === "proyecto"
                      ? `Proyecto: ${proyectoSel}`
                      : active === "cuenta"
                      ? `Cuenta contable`
                      : active === "fichero"
                      ? `Fichero de datos`
                      : active === "config"
                      ? `Configuración`
                      : "Cerrar sesión"
                  }
                />
              </div>

              {/* Card de contenido */}
              <div className="rounded-2xl bg-white/10 backdrop-blur p-5 shadow-lg">
                {renderContent()}
              </div>

              {/* Resumen inferior (azulado claro) */}
              <div className="rounded-2xl bg-blue-50/90 border border-blue-200 p-5 text-blue-900 shadow">
                <h3 className="text-lg font-semibold mb-3">Resumen de selección</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="font-medium">Formato Importación: </span>
                    {formatoImport}
                  </div>
                  <div>
                    <span className="font-medium">Formato Exportación: </span>
                    {formatoExport}
                  </div>
                  <div>
                    <span className="font-medium">Empresa: </span>
                    {empresaSel}
                  </div>
                  <div>
                    <span className="font-medium">Fecha factura: </span>
                    {fecha || "—"}
                  </div>
                  <div>
                    <span className="font-medium">Proyecto: </span>
                    {proyectoSel}
                  </div>
                  <div>
                    <span className="font-medium">Cuenta contable: </span>
                    {cuentaMostrada}
                  </div>
                  <div className="lg:col-span-3">
                    <span className="font-medium">Fichero: </span>
                    {fileName || "—"}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
