// app/dashboard/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type MenuKey =
  | "formatoImport"
  | "formatoExport"
  | "empresa"
  | "fecha"
  | "proyecto"
  | "cuenta"
  | "fichero"
  | "config"
  | "exportar"
  | "cerrar";

const empresas = [
  { id: "001", name: "Kissoro" },
  { id: "002", name: "En Plural Psicologia" },
];

const proyectos = [
  "Servicios de Psicologia",
  "Formacion",
  "Administracion SL",
];

const cuentas = [
  "70500000 Prestaciones de servicios",
  "70000000 Venta de mercaderías",
  "Otra (introducir)",
];

const formatosImport = ["Eholo", "Gestoria"];
const formatosExport = ["Holded", "Gestoria"];

function Item({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-3 py-2 rounded-lg transition
        ${active ? "bg-white/90 shadow font-semibold" : "hover:bg-white/70"}
      `}
    >
      {children}
    </button>
  );
}

export default function DashboardPage() {
  const router = useRouter();

  // --- Protección de ruta (si no hay token, fuera) ---
  useEffect(() => {
    const token = typeof window !== "undefined" ? sessionStorage.getItem("konyx_token") : null;
    if (!token) router.replace("/");
  }, [router]);

  // --- Estado UI / Datos seleccionados ---
  const [menu, setMenu] = useState<MenuKey>("formatoImport");

  const [formatoImp, setFormatoImp] = useState<string | null>(null);
  const [formatoExp, setFormatoExp] = useState<string | null>(null);

  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [fecha, setFecha] = useState<string>(""); // YYYY-MM-DD

  const [proyecto, setProyecto] = useState<string | null>(null);

  const [cuenta, setCuenta] = useState<string | null>(null);
  const [cuentaLibre, setCuentaLibre] = useState<string>("");

  const [fichero, setFichero] = useState<File | null>(null);

  // Config
  const [changePass, setChangePass] = useState(false);
  const [apiHoldedKissoro, setApiHoldedKissoro] = useState("");
  const [apiHoldedEnPlural, setApiHoldedEnPlural] = useState("");

  // Export disponible sólo si todo está completo
  const exportReady = useMemo(() => {
    const empresaOk = !!empresaId;
    const fechaOk = !!fecha;
    const proyectoOk = !!proyecto;
    const cuentaOk =
      !!cuenta &&
      (cuenta !== "Otra (introducir)" || (cuenta === "Otra (introducir)" && cuentaLibre.trim().length > 0));
    const fileOk = !!fichero;
    const formatosOk = !!formatoImp && !!formatoExp;

    return empresaOk && fechaOk && proyectoOk && cuentaOk && fileOk && formatosOk;
  }, [empresaId, fecha, proyecto, cuenta, cuentaLibre, fichero, formatoImp, formatoExp]);

  // Dispara backend (simulado)
  async function handleExportar() {
    if (!exportReady) return;

    const cuentaFinal =
      cuenta === "Otra (introducir)" ? cuentaLibre.trim() : cuenta!;

    // TODO: llamada real backend con todos los datos
    alert(
      `Exportando...
Empresa: ${empresas.find((e) => e.id === empresaId)?.name}
Fecha factura: ${fecha}
Proyecto: ${proyecto}
Cuenta contable: ${cuentaFinal}
Formato Importación: ${formatoImp}
Formato Exportación: ${formatoExp}
Fichero: ${fichero?.name}`
    );
  }

  function rightPanel() {
    switch (menu) {
      case "formatoImport":
        return (
          <section className="bg-white/90 backdrop-blur rounded-2xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Formato Importación</h2>
            <div className="grid grid-cols-1 gap-3">
              {formatosImport.map((f) => (
                <label key={f} className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="formatoImp"
                    checked={formatoImp === f}
                    onChange={() => setFormatoImp(f)}
                  />
                  <span>{f}</span>
                </label>
              ))}
            </div>
          </section>
        );
      case "formatoExport":
        return (
          <section className="bg-white/90 backdrop-blur rounded-2xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Formato Exportación</h2>
            <div className="grid grid-cols-1 gap-3">
              {formatosExport.map((f) => (
                <label key={f} className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="formatoExp"
                    checked={formatoExp === f}
                    onChange={() => setFormatoExp(f)}
                  />
                  <span>{f}</span>
                </label>
              ))}
            </div>
          </section>
        );
      case "empresa":
        return (
          <section className="bg-white/90 backdrop-blur rounded-2xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Empresa (seleccionar)</h2>
            <div className="grid grid-cols-1 gap-3">
              {empresas.map((e) => (
                <label key={e.id} className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="empresa"
                    checked={empresaId === e.id}
                    onChange={() => setEmpresaId(e.id)}
                  />
                  <span>{e.name}</span>
                </label>
              ))}
            </div>
          </section>
        );
      case "fecha":
        return (
          <section className="bg-white/90 backdrop-blur rounded-2xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Fecha factura</h2>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </section>
        );
      case "proyecto":
        return (
          <section className="bg-white/90 backdrop-blur rounded-2xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Proyecto</h2>
            <div className="grid grid-cols-1 gap-3">
              {proyectos.map((p) => (
                <label key={p} className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="proyecto"
                    checked={proyecto === p}
                    onChange={() => setProyecto(p)}
                  />
                  <span>{p}</span>
                </label>
              ))}
            </div>
          </section>
        );
      case "cuenta":
        return (
          <section className="bg-white/90 backdrop-blur rounded-2xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Cuenta contable</h2>
            <div className="grid grid-cols-1 gap-3">
              {cuentas.map((c) => (
                <label key={c} className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="cuenta"
                    checked={cuenta === c}
                    onChange={() => setCuenta(c)}
                  />
                  <span>{c}</span>
                </label>
              ))}

              {cuenta === "Otra (introducir)" && (
                <input
                  type="text"
                  placeholder="Introduce la cuenta contable..."
                  value={cuentaLibre}
                  onChange={(e) => setCuentaLibre(e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              )}
            </div>
          </section>
        );
      case "fichero":
        return (
          <section className="bg-white/90 backdrop-blur rounded-2xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Fichero de datos</h2>
            <input
              type="file"
              accept=".xls,.xlsx,.csv"
              onChange={(e) => setFichero(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0 file:text-sm file:font-semibold
                file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
            {fichero && (
              <p className="text-sm text-gray-600 mt-2">Seleccionado: {fichero.name}</p>
            )}
          </section>
        );
      case "config":
        return (
          <section className="bg-white/90 backdrop-blur rounded-2xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Configuración</h2>
            <div className="space-y-6">
              <div className="border rounded-xl p-4">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={changePass}
                    onChange={(e) => setChangePass(e.target.checked)}
                  />
                  <span>Cambio de contraseña</span>
                </label>
                {changePass && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                    <input
                      type="password"
                      placeholder="Nueva contraseña"
                      className="rounded-lg border px-3 py-2"
                    />
                    <input
                      type="password"
                      placeholder="Repite contraseña"
                      className="rounded-lg border px-3 py-2"
                    />
                    <button className="rounded-lg bg-indigo-600 text-white font-medium py-2 px-4 hover:bg-indigo-700">
                      Guardar
                    </button>
                  </div>
                )}
              </div>

              <div className="border rounded-xl p-4">
                <h3 className="font-medium mb-3">APIs</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm mb-1">API Holded Kissoro</label>
                    <input
                      value={apiHoldedKissoro}
                      onChange={(e) => setApiHoldedKissoro(e.target.value)}
                      className="w-full rounded-lg border px-3 py-2"
                      placeholder="Token/API Key..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">API Holded En Plural Psicologia</label>
                    <input
                      value={apiHoldedEnPlural}
                      onChange={(e) => setApiHoldedEnPlural(e.target.value)}
                      className="w-full rounded-lg border px-3 py-2"
                      placeholder="Token/API Key..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      case "exportar":
        return (
          <section className="bg-white/90 backdrop-blur rounded-2xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Exportación</h2>
            <p className="text-sm text-gray-700 mb-4">
              Confirma para exportar los datos al formato seleccionado.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleExportar}
                disabled={!exportReady}
                className={`rounded-lg px-4 py-2 font-medium ${
                  exportReady
                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                Sí, exportar
              </button>
              <button
                onClick={() => setMenu("formatoExport")}
                className="rounded-lg px-4 py-2 font-medium bg-gray-100 hover:bg-gray-200"
              >
                No, volver
              </button>
            </div>
          </section>
        );
      case "cerrar":
        // limpia sesión y vuelve al login
        sessionStorage.removeItem("konyx_token");
        router.replace("/");
        return null;
      default:
        return null;
    }
  }

  const empresaNombre = empresas.find((e) => e.id === empresaId)?.name || "-";
  const cuentaFinal =
    cuenta === "Otra (introducir)" ? (cuentaLibre || "-") : (cuenta || "-");
  const exportBtnClass = exportReady
    ? "bg-indigo-600 text-white hover:bg-indigo-700"
    : "bg-gray-200 text-gray-500 cursor-not-allowed";

  return (
    <main
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url(/fondo.png)' }}
    >
      {/* Layout principal: sidebar completamente a la izquierda + contenido a la derecha */}
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-[280px_minmax(0,1fr)] gap-6 items-start">
          {/* ---- Sidebar (más a la izquierda) ---- */}
          <aside className="md:sticky md:top-6">
            <div className="bg-white/90 backdrop-blur rounded-2xl shadow p-4">
              <div className="flex justify-center mb-4">
                <img
                  src="/logo.png"
                  alt="Konyx"
                  className="h-[17rem] w-auto drop-shadow-md"
                />
              </div>

              <nav className="space-y-2">
                <Item active={menu === "formatoImport"} onClick={() => setMenu("formatoImport")}>
                  Formato Importación
                </Item>
                <Item active={menu === "formatoExport"} onClick={() => setMenu("formatoExport")}>
                  Formato Exportación
                </Item>
                <Item active={menu === "empresa"} onClick={() => setMenu("empresa")}>
                  Empresa (seleccionar)
                </Item>
                <Item active={menu === "fecha"} onClick={() => setMenu("fecha")}>
                  Fecha factura
                </Item>
                <Item active={menu === "proyecto"} onClick={() => setMenu("proyecto")}>
                  Proyecto
                </Item>
                <Item active={menu === "cuenta"} onClick={() => setMenu("cuenta")}>
                  Cuenta contable
                </Item>
                <Item active={menu === "fichero"} onClick={() => setMenu("fichero")}>
                  Fichero de datos
                </Item>
                <Item active={menu === "config"} onClick={() => setMenu("config")}>
                  Configuración
                </Item>

                {/* Exportar resaltado sólo cuando esté disponible */}
                <button
                  type="button"
                  onClick={() => exportReady && setMenu("exportar")}
                  className={`w-full text-left px-3 py-2 rounded-lg transition font-semibold border
                    ${exportReady ? "border-emerald-600 text-emerald-700 hover:bg-emerald-50" : "border-gray-300 text-gray-400 cursor-not-allowed"}
                  `}
                  title={exportReady ? "Listo para exportar" : "Completa todos los campos para exportar"}
                >
                  Exportar
                </button>

                <div className="pt-2">
                  <Item active={menu === "cerrar"} onClick={() => setMenu("cerrar")}>
                    Cerrar Sesión
                  </Item>
                </div>
              </nav>
            </div>
          </aside>

          {/* ---- Panel derecho (contenido de cada menú) ---- */}
          <section className="space-y-6">
            {rightPanel()}

            {/* Resumen inferior con tono azul claro */}
            <div className="bg-sky-50/90 backdrop-blur rounded-2xl shadow p-6 border border-sky-200">
              <h3 className="text-base font-semibold text-sky-900 mb-3">Resumen de selección</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="font-medium text-sky-900">Empresa: </span>
                  <span className="text-sky-800">{empresaNombre}</span>
                </div>
                <div>
                  <span className="font-medium text-sky-900">Fecha factura: </span>
                  <span className="text-sky-800">{fecha || "-"}</span>
                </div>
                <div>
                  <span className="font-medium text-sky-900">Proyecto: </span>
                  <span className="text-sky-800">{proyecto || "-"}</span>
                </div>
                <div>
                  <span className="font-medium text-sky-900">Cuenta contable: </span>
                  <span className="text-sky-800">{cuentaFinal}</span>
                </div>
                <div>
                  <span className="font-medium text-sky-900">Formato Importación: </span>
                  <span className="text-sky-800">{formatoImp || "-"}</span>
                </div>
                <div>
                  <span className="font-medium text-sky-900">Formato Exportación: </span>
                  <span className="text-sky-800">{formatoExp || "-"}</span>
                </div>
                <div className="md:col-span-2">
                  <span className="font-medium text-sky-900">Fichero: </span>
                  <span className="text-sky-800">{fichero?.name || "-"}</span>
                </div>
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  disabled={!exportReady}
                  onClick={() => setMenu("exportar")}
                  className={`rounded-lg px-4 py-2 font-medium ${exportBtnClass}`}
                >
                  Continuar a Exportar
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
