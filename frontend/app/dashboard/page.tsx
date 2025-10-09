"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/authContext";

import PanelOption from "../../components/PanelOption";
import { PanelDate } from "../../components/PanelDate";
import { PanelFile } from "../../components/PanelFile";
import { PanelConfig } from "../../components/PanelConfig";
import { PanelExport } from "../../components/PanelExport";
import { PanelCerrar } from "../../components/PanelCerrar";
import { PanelDebug } from "../../components/PanelDebug";
import { PanelAbout } from "../../components/PanelAbout";
import { Item } from "../../components/Item";

const FORMATO_IMPORT_OPTS = ["Eholo", "Gestoria"] as const;
const FORMATO_EXPORT_OPTS = ["Holded", "Gestoria"] as const;
const EMPRESAS = ["Kissoro", "En Plural Psicologia"] as const;
const PROYECTOS = ["Servicios de Psicologia", "Formacion", "Administracion SL"] as const;
const CUENTAS = [
  "70500000 Prestaciones de servicios",
  "70000000 Venta de mercaderías",
  "Otra (introducir)",
] as const;

type MenuKey =
  | "formatoImport"
  | "formatoExport"
  | "empresa"
  | "fecha"
  | "proyecto"
  | "cuenta"
  | "fichero"
  | "config"
  | "about"
  | "exportar"
  | "cerrar";

export default function DashboardPage() {
  const { token, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !token) router.replace("/");
  }, [token, loading, router]);

  if (loading || !token) return null;

  // ---------------------------
  // ESTADOS DEL DASHBOARD
  // ---------------------------
  const [menu, setMenu] = useState<MenuKey>("formatoImport");
  const [formatoImport, setFormatoImport] = useState<typeof FORMATO_IMPORT_OPTS[number] | null>(null);
  const [formatoExport, setFormatoExport] = useState<typeof FORMATO_EXPORT_OPTS[number] | null>(null);
  const [empresa, setEmpresa] = useState<typeof EMPRESAS[number] | null>(null);
  const [fechaFactura, setFechaFactura] = useState("");
  const [proyecto, setProyecto] = useState<typeof PROYECTOS[number] | null>(null);
  const [cuenta, setCuenta] = useState<typeof CUENTAS[number] | null>(null);
  const [cuentaOtra, setCuentaOtra] = useState("");
  const [ficheroNombre, setFicheroNombre] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Contraseña global
  const [passActual, setPassActual] = useState("");
  const [passNueva, setPassNueva] = useState("");
  const [passConfirma, setPassConfirma] = useState("");
  const [passMsg, setPassMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [passwordGlobal, setPasswordGlobal] = useState(() => sessionStorage.getItem("konyx_password") || "1234");

  // APIs
  const [apiKissoroVigente, setApiKissoroVigente] = useState(() => localStorage.getItem("apiKissoro") || "");
  const [apiKissoroNuevo, setApiKissoroNuevo] = useState("");
  const [apiEnPluralVigente, setApiEnPluralVigente] = useState(() => localStorage.getItem("apiEnPlural") || "");
  const [apiEnPluralNuevo, setApiEnPluralNuevo] = useState("");

  // Exportaciones (persistentes)
  const [ultimoExport, setUltimoExport] = useState("-");
  const [totalExportaciones, setTotalExportaciones] = useState(0);

  // ---------------------------
  // FUNCIONES
  // ---------------------------

  const onPickFileClick = () => fileInputRef.current?.click();
  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => setFicheroNombre(e.target.files?.[0]?.name || "");

  const cuentaOk = cuenta === "Otra (introducir)" ? cuentaOtra.trim().length > 0 : !!cuenta;
  const exportReady =
    !!formatoImport && !!formatoExport && !!empresa && !!fechaFactura && !!proyecto && cuentaOk && !!ficheroNombre;

  // 🔄 Sincronizar datos iniciales desde backend
  useEffect(() => {
    const fetchBackendData = async () => {
      try {
        const res = await fetch("http://192.168.1.51:8000/auth/status");
        if (!res.ok) throw new Error("Error al sincronizar datos del backend");
        const data = await res.json();

        setPasswordGlobal(data.password || "1234");
        sessionStorage.setItem("konyx_password", data.password || "1234");

        setApiKissoroVigente(data.apiKissoro || "");
        localStorage.setItem("apiKissoro", data.apiKissoro || "");

        setApiEnPluralVigente(data.apiEnPlural || "");
        localStorage.setItem("apiEnPlural", data.apiEnPlural || "");

        setUltimoExport(data.ultimoExport || "-");
        setTotalExportaciones(data.totalExportaciones || 0);
      } catch (err) {
        console.error("Error sincronizando con backend:", err);
      }
    };
    fetchBackendData();
  }, []);

  // 🚀 Enviar exportación al backend
  const onConfirmExport = async (ok: boolean) => {
    if (!ok) {
      setMenu("formatoImport");
      return;
    }

    try {
      const usuario = sessionStorage.getItem("konyx_user") || "desconocido";

      const body = {
        formatoImport,
        formatoExport,
        empresa,
        fechaFactura,
        proyecto,
        cuenta: cuenta === "Otra (introducir)" ? cuentaOtra : cuenta,
        ficheroNombre,
        usuario,
      };

      const res = await fetch("http://192.168.1.51:8000/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Error al registrar exportación");

      const data = await res.json();
      console.log("✅ Exportación enviada al backend:", data);

      setUltimoExport(data.ultimoExport || "-");
      setTotalExportaciones(data.totalExportaciones || 0);

      alert(`Exportación enviada correctamente ✅
Última exportación: ${data.ultimoExport}
Total: ${data.totalExportaciones}`);
    } catch (err) {
      console.error("❌ Error al exportar:", err);
      alert("Error al registrar la exportación.");
    }

    setMenu("formatoImport");
  };

  // 🔐 Cerrar sesión (sin borrar contraseña ni APIs)
  const logout = () => {
    sessionStorage.removeItem("konyx_token");
    router.replace("/");
  };

  // ---------------------------
  // RENDER
  // ---------------------------
  return (
    <main
      className="min-h-screen bg-no-repeat bg-center bg-cover p-4"
      style={{ backgroundImage: "url(/fondo.png)", backgroundSize: "100% 100%" }}
    >
      <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
        {/* Sidebar */}
        <aside className="md:sticky md:top-6">
          <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg p-4">
            <div className="flex justify-center mb-4">
              <img src="/logo.png" alt="Konyx" className="h-48 w-auto drop-shadow-md" />
            </div>
            <nav className="space-y-2">
              {[
                "formatoImport",
                "formatoExport",
                "empresa",
                "fecha",
                "proyecto",
                "cuenta",
                "fichero",
                "config",
                "about",
                "cerrar",
              ].map((mk) => (
                <Item
                  key={mk}
                  active={menu === (mk as MenuKey)}
                  onClick={() => setMenu(mk as MenuKey)}
                  className="hover:bg-indigo-200 hover:text-indigo-800 transition"
                >
                  {mk === "formatoImport"
                    ? "Formato Importación"
                    : mk === "formatoExport"
                    ? "Formato Exportación"
                    : mk === "empresa"
                    ? "Empresa"
                    : mk === "fecha"
                    ? "Fecha factura"
                    : mk === "proyecto"
                    ? "Proyecto"
                    : mk === "cuenta"
                    ? "Cuenta contable"
                    : mk === "fichero"
                    ? "Fichero de datos"
                    : mk === "config"
                    ? "Configuración"
                    : mk === "about"
                    ? "Acerca de Konyx"
                    : "Cerrar Sesión"}
                </Item>
              ))}
              <button
                className={`w-full text-left px-3 py-2 rounded-lg font-semibold border transition
                  ${
                    exportReady
                      ? "border-indigo-600 text-indigo-700 bg-white/90 shadow hover:bg-indigo-200 hover:text-indigo-800"
                      : "border-gray-300 text-gray-200 cursor-not-allowed"
                  }`}
                onClick={() => exportReady && setMenu("exportar")}
              >
                Exportar
              </button>
            </nav>
          </div>
        </aside>

        {/* Contenido */}
        <section className="flex flex-col space-y-6">
          {menu === "formatoImport" && (
            <PanelOption title="Formato Importación" options={FORMATO_IMPORT_OPTS} value={formatoImport} onChange={setFormatoImport} />
          )}
          {menu === "formatoExport" && (
            <PanelOption title="Formato Exportación" options={FORMATO_EXPORT_OPTS} value={formatoExport} onChange={setFormatoExport} />
          )}
          {menu === "empresa" && <PanelOption title="Empresa" options={EMPRESAS} value={empresa} onChange={setEmpresa} />}
          {menu === "proyecto" && <PanelOption title="Proyecto" options={PROYECTOS} value={proyecto} onChange={setProyecto} />}
          {menu === "cuenta" && (
            <PanelOption title="Cuenta contable" options={CUENTAS} value={cuenta} onChange={setCuenta}>
              {cuenta === "Otra (introducir)" && (
                <input
                  type="text"
                  value={cuentaOtra}
                  onChange={(e) => setCuentaOtra(e.target.value)}
                  placeholder="Introduce tu cuenta"
                  className="w-full rounded-lg border border-indigo-300 px-3 py-2 mt-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              )}
            </PanelOption>
          )}
          {menu === "fecha" && <PanelDate title="Fecha factura" value={fechaFactura} onChange={setFechaFactura} />}
          {menu === "fichero" && (
            <PanelFile value={ficheroNombre} onPickFile={onPickFile} onPickFileClick={onPickFileClick} fileInputRef={fileInputRef} />
          )}

          {menu === "config" && (
            <div className="space-y-6">
              <PanelConfig
                passActual={passActual}
                passNueva={passNueva}
                passConfirma={passConfirma}
                setPassActual={setPassActual}
                setPassNueva={setPassNueva}
                setPassConfirma={setPassConfirma}
                passMsg={passMsg}
                setPassMsg={setPassMsg}
                passwordGlobal={passwordGlobal}
                setPasswordGlobal={setPasswordGlobal}
                apiKissoroVigente={apiKissoroVigente}
                apiKissoroNuevo={apiKissoroNuevo}
                setApiKissoroNuevo={setApiKissoroNuevo}
                apiKissoroMsg={null}
                setApiKissoroVigente={setApiKissoroVigente}
                apiEnPluralVigente={apiEnPluralVigente}
                apiEnPluralNuevo={apiEnPluralNuevo}
                setApiEnPluralNuevo={setApiEnPluralNuevo}
                apiEnPluralMsg={null}
                setApiEnPluralVigente={setApiEnPluralVigente}
              />
              <PanelDebug
                passwordGlobal={passwordGlobal}
                apiKissoroVigente={apiKissoroVigente}
                apiEnPluralVigente={apiEnPluralVigente}
                ultimoExport={ultimoExport}
                totalExportaciones={totalExportaciones}
              />
            </div>
          )}

          {menu === "about" && <PanelAbout />}

          {menu === "exportar" && <PanelExport onConfirm={onConfirmExport} />}
          {menu === "cerrar" && <PanelCerrar onConfirm={logout} onCancel={() => setMenu("formatoImport")} />}

          {/* Panel de Resumen */}
          {!["config", "cerrar", "about"].includes(menu) && (
            <div className="bg-blue-100/80 backdrop-blur-md rounded-2xl shadow-lg p-6 mt-4">
              <h4 className="font-bold text-xl mb-6 text-indigo-800 text-center">
                Panel de Resumen
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Fila 1 */}
                <div className="bg-white rounded-xl p-4 shadow flex flex-col items-center justify-center text-center">
                  <span className="text-gray-500 font-semibold">📥 Importación</span>
                  <span className="text-2xl font-bold text-indigo-700">{formatoImport || "-"}</span>
                </div>

                <div className="bg-white rounded-xl p-4 shadow flex flex-col items-center justify-center text-center">
                  <span className="text-gray-500 font-semibold">📤 Exportación</span>
                  <span className="text-2xl font-bold text-indigo-700">{formatoExport || "-"}</span>
                </div>

                <div className="bg-white rounded-xl p-4 shadow flex flex-col items-center justify-center text-center">
                  <span className="text-gray-500 font-semibold">🏢 Empresa</span>
                  <span className="text-2xl font-bold text-indigo-700">{empresa || "-"}</span>
                </div>

                {/* Fila 2 */}
                <div className="bg-white rounded-xl p-4 shadow flex flex-col items-center justify-center text-center">
                  <span className="text-gray-500 font-semibold">📅 Fecha factura</span>
                  <span className="text-2xl font-bold text-indigo-700">
                    {fechaFactura ? new Date(fechaFactura).toLocaleDateString("es-ES") : "-"}
                  </span>
                </div>

                <div className="bg-white rounded-xl p-4 shadow flex flex-col items-center justify-center text-center">
                  <span className="text-gray-500 font-semibold">💳 Cuenta</span>
                  <span className="text-2xl font-bold text-indigo-700">
                    {cuenta === "Otra (introducir)" ? cuentaOtra : cuenta || "-"}
                  </span>
                </div>

                <div className="bg-white rounded-xl p-4 shadow flex flex-col items-center justify-center text-center">
                  <span className="text-gray-500 font-semibold">🗂 Proyecto</span>
                  <span className="text-2xl font-bold text-indigo-700">{proyecto || "-"}</span>
                </div>

                {/* Fila 3 */}
                <div className="bg-white rounded-xl p-4 shadow flex flex-col items-center justify-center text-center md:col-span-3">
                  <span className="text-gray-500 font-semibold">📁 Fichero</span>
                  <span className="text-indigo-700 text-lg truncate max-w-[80%]">
                    {ficheroNombre || "-"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
