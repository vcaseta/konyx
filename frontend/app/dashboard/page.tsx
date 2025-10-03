// app/dashboard/page.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type FormatoImport = "Eholo" | "Gestoria" | "";
type FormatoExport = "Holded" | "Gestoria" | "";
type Empresa = "Kissoro" | "En Plural Psicologia" | "";
type Proyecto = "Servicios de Psicologia" | "Formacion" | "Administracion SL" | "";
type Cuenta =
  | "70500000 Prestaciones de servicios"
  | "70000000 Venta de mercaderías"
  | "Otra"
  | "";

type MenuKey =
  | "formatoImport"
  | "formatoExport"
  | "empresa"
  | "fecha"
  | "proyecto"
  | "cuenta"
  | "fichero"
  | "config"
  | "exportar";

export default function DashboardPage() {
  const router = useRouter();

  // --- Estado de selección ---
  const [menu, setMenu] = useState<MenuKey>("formatoImport");

  const [formatoImport, setFormatoImport] = useState<FormatoImport>("");
  const [formatoExport, setFormatoExport] = useState<FormatoExport>("");
  const [empresa, setEmpresa] = useState<Empresa>("");
  const [fechaFactura, setFechaFactura] = useState<string>("");
  const [proyecto, setProyecto] = useState<Proyecto>("");
  const [cuenta, setCuenta] = useState<Cuenta>("");
  const [cuentaOtra, setCuentaOtra] = useState<string>("");
  const [fichero, setFichero] = useState<File | null>(null);

  // Config (placeholder UI)
  const [cfgPass, setCfgPass] = useState<string>("");
  const [cfgApiKissoro, setCfgApiKissoro] = useState<string>("");
  const [cfgApiEnPlural, setCfgApiEnPlural] = useState<string>("");
  const [cfgFormatoExcel, setCfgFormatoExcel] = useState<string>("");

  // Modal confirmación exportación
  const [showConfirm, setShowConfirm] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportMsg, setExportMsg] = useState<string | null>(null);

  // Reglas para habilitar Exportar
  const exportReady = useMemo(() => {
    const cuentaOK = cuenta === "Otra" ? cuentaOtra.trim().length > 0 : !!cuenta;
    return (
      !!formatoImport &&
      !!formatoExport &&
      !!empresa &&
      !!fechaFactura &&
      !!proyecto &&
      cuentaOK &&
      !!fichero
    );
  }, [formatoImport, formatoExport, empresa, fechaFactura, proyecto, cuenta, cuentaOtra, fichero]);

  // Acción de exportación (estructura lista)
  async function doExport() {
    try {
      setExporting(true);
      setExportMsg(null);

      // Envío como JSON (para fichero, de momento solo el nombre; más adelante FormData si quieres subirlo)
      const payload = {
        formatoImport,
        formatoExport,
        empresa,
        fechaFactura,
        proyecto,
        cuenta: cuenta === "Otra" ? cuentaOtra : cuenta,
        ficheroNombre: fichero?.name ?? null,
      };

      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json().catch(() => ({}));

      setExportMsg(
        data?.message ||
          "Exportación lanzada correctamente. (Backend por definir)"
      );
    } catch (err: any) {
      setExportMsg(
        `No se pudo exportar: ${err?.message || "error desconocido"}`
      );
    } finally {
      setExporting(false);
      setShowConfirm(false);
    }
  }

  // Cerrar sesión
  function logout() {
    router.replace("/");
  }

  // --- UI helpers ---
  const Item = ({
    active,
    disabled,
    onClick,
    children,
    highlight,
  }: {
    active?: boolean;
    disabled?: boolean;
    onClick?: () => void;
    children: React.ReactNode;
    highlight?: boolean; // para "Exportar" resaltada
  }) => {
    const base =
      "w-full text-left px-3 py-2 rounded-lg transition outline-none";
    const normal =
      "hover:bg-white/10 focus:bg-white/10 text-white/90";
    const activeCls = "bg-white/15 text-white font-medium";
    const disabledCls = "opacity-40 cursor-not-allowed";
    const highlightCls = "bg-blue-500/20 text-white border border-blue-300 hover:bg-blue-500/25";

    return (
      <button
        type="button"
        className={[
          base,
          disabled ? disabledCls : highlight ? highlightCls : active ? activeCls : normal,
        ].join(" ")}
        onClick={disabled ? undefined : onClick}
        aria-disabled={disabled}
      >
        {children}
      </button>
    );
  };

  return (
    <main
      className="min-h-screen bg-no-repeat bg-center bg-cover"
      style={{
        backgroundImage: "url(/fondo.png)",
        backgroundSize: "100% 100%",
      }}
    >
      <div className="min-h-screen bg-black/30">
        <div className="mx-auto max-w-6xl px-4 py-8 grid grid-cols-12 gap-6">
          {/* --- Sidebar (más estrecho) --- */}
          <aside className="col-span-12 md:col-span-3">
            <div className="bg-white/10 backdrop-blur rounded-2xl border border-white/15 p-4">
              <div className="flex justify-center mb-4">
                <img
                  src="/logo.png"
                  alt="Konyx"
                  className="h-24 w-auto"
                />
              </div>

              <div className="space-y-1">
                <Item
                  active={menu === "formatoImport"}
                  onClick={() => setMenu("formatoImport")}
                >
                  Formato Importación
                </Item>
                {menu === "formatoImport" && (
                  <div className="ml-2 space-y-1">
                    <Item onClick={() => setFormatoImport("Eholo")}>
                      Eholo {formatoImport === "Eholo" ? "✓" : ""}
                    </Item>
                    <Item onClick={() => setFormatoImport("Gestoria")}>
                      Gestoria {formatoImport === "Gestoria" ? "✓" : ""}
                    </Item>
                  </div>
                )}

                <Item
                  active={menu === "formatoExport"}
                  onClick={() => setMenu("formatoExport")}
                >
                  Formato Exportación
                </Item>
                {menu === "formatoExport" && (
                  <div className="ml-2 space-y-1">
                    <Item onClick={() => setFormatoExport("Holded")}>
                      Holded {formatoExport === "Holded" ? "✓" : ""}
                    </Item>
                    <Item onClick={() => setFormatoExport("Gestoria")}>
                      Gestoria {formatoExport === "Gestoria" ? "✓" : ""}
                    </Item>
                  </div>
                )}

                <Item
                  active={menu === "empresa"}
                  onClick={() => setMenu("empresa")}
                >
                  Empresa (seleccionar)
                </Item>
                {menu === "empresa" && (
                  <div className="ml-2 space-y-1">
                    <Item onClick={() => setEmpresa("Kissoro")}>
                      Kissoro {empresa === "Kissoro" ? "✓" : ""}
                    </Item>
                    <Item onClick={() => setEmpresa("En Plural Psicologia")}>
                      En Plural Psicologia{" "}
                      {empresa === "En Plural Psicologia" ? "✓" : ""}
                    </Item>
                  </div>
                )}

                <Item
                  active={menu === "fecha"}
                  onClick={() => setMenu("fecha")}
                >
                  Fecha factura
                </Item>

                <Item
                  active={menu === "proyecto"}
                  onClick={() => setMenu("proyecto")}
                >
                  Proyecto
                </Item>
                {menu === "proyecto" && (
                  <div className="ml-2 space-y-1">
                    <Item onClick={() => setProyecto("Servicios de Psicologia")}>
                      Servicios de Psicologia{" "}
                      {proyecto === "Servicios de Psicologia" ? "✓" : ""}
                    </Item>
                    <Item onClick={() => setProyecto("Formacion")}>
                      Formacion {proyecto === "Formacion" ? "✓" : ""}
                    </Item>
                    <Item onClick={() => setProyecto("Administracion SL")}>
                      Administracion SL{" "}
                      {proyecto === "Administracion SL" ? "✓" : ""}
                    </Item>
                  </div>
                )}

                <Item
                  active={menu === "cuenta"}
                  onClick={() => setMenu("cuenta")}
                >
                  Cuenta contable
                </Item>
                {menu === "cuenta" && (
                  <div className="ml-2 space-y-1">
                    <Item
                      onClick={() =>
                        setCuenta("70500000 Prestaciones de servicios")
                      }
                    >
                      70500000 Prestaciones de servicios{" "}
                      {cuenta === "70500000 Prestaciones de servicios" ? "✓" : ""}
                    </Item>
                    <Item
                      onClick={() =>
                        setCuenta("70000000 Venta de mercaderías")
                      }
                    >
                      70000000 Venta de mercaderías{" "}
                      {cuenta === "70000000 Venta de mercaderías" ? "✓" : ""}
                    </Item>
                    <Item onClick={() => setCuenta("Otra")}>
                      Otra {cuenta === "Otra" ? "✓" : ""}
                    </Item>
                  </div>
                )}

                <Item
                  active={menu === "fichero"}
                  onClick={() => setMenu("fichero")}
                >
                  Fichero de datos
                </Item>

                <Item
                  active={menu === "config"}
                  onClick={() => setMenu("config")}
                >
                  Configuración
                </Item>

                {/* Exportar */}
                <Item
                  active={menu === "exportar"}
                  onClick={() => setMenu("exportar")}
                  disabled={!exportReady}
                  highlight={exportReady}
                >
                  Exportar
                </Item>

                {/* Cerrar sesión */}
                <div className="pt-2">
                  <Item onClick={logout}>Cerrar sesión</Item>
                </div>
              </div>
            </div>
          </aside>

          {/* --- Contenido central --- */}
          <section className="col-span-12 md:col-span-9 space-y-4">
            <div className="bg-white/90 backdrop-blur rounded-2xl shadow p-6">
              {menu === "formatoImport" && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">
                    Formato Importación
                  </h2>
                  <p className="text-sm text-gray-600">
                    Selecciona el formato desde el que vas a importar los datos.
                  </p>
                </div>
              )}

              {menu === "formatoExport" && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">
                    Formato Exportación
                  </h2>
                  <p className="text-sm text-gray-600">
                    Selecciona el destino de la exportación.
                  </p>
                </div>
              )}

              {menu === "empresa" && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Empresa</h2>
                  <p className="text-sm text-gray-600">
                    Has de elegir la empresa para la que se realizará la
                    exportación.
                  </p>
                </div>
              )}

              {menu === "fecha" && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Fecha factura</h2>
                  <input
                    type="date"
                    value={fechaFactura}
                    onChange={(e) => setFechaFactura(e.target.value)}
                    className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}

              {menu === "proyecto" && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Proyecto</h2>
                  <p className="text-sm text-gray-600">
                    Selecciona el proyecto asociado a la operación.
                  </p>
                </div>
              )}

              {menu === "cuenta" && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Cuenta contable</h2>
                  <p className="text-sm text-gray-600">
                    Si seleccionas <b>Otra</b>, indica el número de cuenta.
                  </p>
                  {cuenta === "Otra" && (
                    <input
                      type="text"
                      value={cuentaOtra}
                      onChange={(e) => setCuentaOtra(e.target.value)}
                      placeholder="Ej: 70100000 ..."
                      className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  )}
                </div>
              )}

              {menu === "fichero" && (
                <div className="space-y-3">
                  <h2 className="text-xl font-semibold">Fichero de datos</h2>
                  <p className="text-sm text-gray-600">
                    Importa un fichero Excel o CSV desde tu equipo.
                  </p>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={(e) => setFichero(e.target.files?.[0] ?? null)}
                    className="block"
                  />
                  {fichero && (
                    <p className="text-sm text-gray-700">
                      Seleccionado: <b>{fichero.name}</b>
                    </p>
                  )}
                </div>
              )}

              {menu === "config" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold">Configuración</h2>

                  <div>
                    <h3 className="font-medium mb-2">Cambio de contraseña</h3>
                    <input
                      type="password"
                      value={cfgPass}
                      onChange={(e) => setCfgPass(e.target.value)}
                      placeholder="Nueva contraseña"
                      className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">APIs</h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={cfgApiKissoro}
                        onChange={(e) => setCfgApiKissoro(e.target.value)}
                        placeholder="API Holded Kissoro"
                        className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="text"
                        value={cfgApiEnPlural}
                        onChange={(e) => setCfgApiEnPlural(e.target.value)}
                        placeholder="API Holded En Plural Psicologia"
                        className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Formatos Excel</h3>
                    <input
                      type="text"
                      value={cfgFormatoExcel}
                      onChange={(e) => setCfgFormatoExcel(e.target.value)}
                      placeholder="Descripción/plantilla seleccionada"
                      className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}

              {menu === "exportar" && (
                <div className="space-y-3">
                  <h2 className="text-xl font-semibold">Exportar</h2>
                  {!exportReady ? (
                    <p className="text-sm text-gray-600">
                      Completa todos los datos para poder exportar.
                    </p>
                  ) : (
                    <>
                      <p className="text-sm text-gray-700">
                        Todo listo. Pulsa en{" "}
                        <b>Confirmar exportación</b> para continuar.
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowConfirm(true)}
                        className="rounded-lg bg-indigo-600 text-white font-medium px-4 py-2 hover:bg-indigo-700"
                      >
                        Confirmar exportación
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* --- Resumen inferior (azulado claro) --- */}
            <div className="bg-blue-50/90 rounded-2xl border border-blue-200 p-4 text-sm text-blue-900">
              <h3 className="font-semibold mb-2">Resumen de selección</h3>
              <div className="grid md:grid-cols-2 gap-x-6 gap-y-2">
                <p>
                  <b>Formato Importación:</b>{" "}
                  {formatoImport || <span className="text-blue-500">—</span>}
                </p>
                <p>
                  <b>Formato Exportación:</b>{" "}
                  {formatoExport || <span className="text-blue-500">—</span>}
                </p>
                <p>
                  <b>Empresa:</b>{" "}
                  {empresa || <span className="text-blue-500">—</span>}
                </p>
                <p>
                  <b>Fecha factura:</b>{" "}
                  {fechaFactura || <span className="text-blue-500">—</span>}
                </p>
                <p>
                  <b>Proyecto:</b>{" "}
                  {proyecto || <span className="text-blue-500">—</span>}
                </p>
                <p>
                  <b>Cuenta contable:</b>{" "}
                  {cuenta
                    ? cuenta === "Otra"
                      ? cuentaOtra || <span className="text-blue-500">—</span>
                      : cuenta
                    : <span className="text-blue-500">—</span>}
                </p>
                <p className="md:col-span-2">
                  <b>Fichero:</b>{" "}
                  {fichero?.name || <span className="text-blue-500">—</span>}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Modal de confirmación */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-semibold">Confirmar exportación</h3>
            <p className="text-sm text-gray-700">
              ¿Quieres exportar los datos seleccionados?
            </p>

            {exportMsg && (
              <p className="text-sm rounded border px-3 py-2 bg-gray-50">
                {exportMsg}
              </p>
            )}

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-50"
                disabled={exporting}
              >
                No
              </button>
              <button
                type="button"
                onClick={doExport}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                disabled={exporting}
              >
                {exporting ? "Exportando..." : "Sí, exportar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

    </main>
  );
}
