"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/authContext";

import PanelOption from "../../components/PanelOption";
import { PanelDate } from "../../components/PanelDate";
import { PanelFile } from "../../components/PanelFile";
import { PanelFileContactos } from "../../components/PanelFileContactos";
import { PanelConfig } from "../../components/PanelConfig";
import { PanelExport } from "../../components/PanelExport";
import { PanelCerrar } from "../../components/PanelCerrar";
import { PanelDebug } from "../../components/PanelDebug";
import { PanelAbout } from "../../components/PanelAbout";
import { PanelResumen } from "../../components/PanelResumen";
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

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.51:8000";

type MenuKey =
  | "formatoImport"
  | "formatoExport"
  | "empresa"
  | "fecha"
  | "proyecto"
  | "cuenta"
  | "ficheroSesiones"
  | "ficheroContactos"
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
  // ESTADOS PRINCIPALES
  // ---------------------------
  const [menu, setMenu] = useState<MenuKey>("formatoImport");
  const [formatoImport, setFormatoImport] = useState<string | null>(null);
  const [formatoExport, setFormatoExport] = useState<string | null>(null);
  const [empresa, setEmpresa] = useState<string | null>(null);
  const [fechaFactura, setFechaFactura] = useState("");
  const [proyecto, setProyecto] = useState<string | null>(null);
  const [cuenta, setCuenta] = useState<string | null>(null);
  const [cuentaOtra, setCuentaOtra] = useState("");

  // 🗂️ Ficheros
  const [ficheroSesiones, setFicheroSesiones] = useState<File | null>(null);
  const [ficheroContactos, setFicheroContactos] = useState<File | null>(null);
  const [usarUltimoContactos, setUsarUltimoContactos] = useState(false);
  const fileSesionesRef = useRef<HTMLInputElement>(null);
  const fileContactosRef = useRef<HTMLInputElement>(null);

  // 🔐 Configuración y APIs
  const [passActual, setPassActual] = useState("");
  const [passNueva, setPassNueva] = useState("");
  const [passConfirma, setPassConfirma] = useState("");
  const [passMsg, setPassMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [passwordGlobal, setPasswordGlobal] = useState(() => sessionStorage.getItem("konyx_password") || "1234");
  const [apiKissoroVigente, setApiKissoroVigente] = useState(() => localStorage.getItem("apiKissoro") || "");
  const [apiKissoroNuevo, setApiKissoroNuevo] = useState("");
  const [apiEnPluralVigente, setApiEnPluralVigente] = useState(() => localStorage.getItem("apiEnPlural") || "");
  const [apiEnPluralNuevo, setApiEnPluralNuevo] = useState("");
  const [apiGroqVigente, setApiGroqVigente] = useState(() => localStorage.getItem("apiGroq") || "");
  const [apiGroqNuevo, setApiGroqNuevo] = useState("");

  // 🧩 Debug
  const [ultimoExport, setUltimoExport] = useState("-");
  const [totalExportaciones, setTotalExportaciones] = useState(0);
  const [totalExportacionesFallidas, setTotalExportacionesFallidas] = useState(0);
  const [intentosLoginFallidos, setIntentosLoginFallidos] = useState(0);
  const [totalLogins, setTotalLogins] = useState(0);
  const [tokenActual] = useState(token || "konyx_token_demo");

  // ---------------------------
  // HELPERS
  // ---------------------------
  const cuentaOk = cuenta === "Otra (introducir)" ? cuentaOtra.trim().length > 0 : !!cuenta;
  const exportReady =
    !!formatoImport &&
    !!formatoExport &&
    !!empresa &&
    !!fechaFactura &&
    !!proyecto &&
    cuentaOk &&
    ficheroSesiones !== null &&
    (usarUltimoContactos || ficheroContactos !== null);

  const onPickSesionesClick = () => fileSesionesRef.current?.click();
  const onPickContactosClick = () => fileContactosRef.current?.click();

  const onPickSesiones = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFicheroSesiones(e.target.files?.[0] || null);

  const onPickContactos = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFicheroContactos(e.target.files?.[0] || null);

  // ---------------------------
  // REFRESCAR ESTADÍSTICAS
  // ---------------------------
  const refreshStats = async () => {
    try {
      const res = await fetch(`${BACKEND}/auth/status`);
      if (!res.ok) return;
      const s = await res.json();
      setUltimoExport(s.ultimoExport || "-");
      setTotalExportaciones(s.totalExportaciones || 0);
      setTotalExportacionesFallidas(s.totalExportacionesFallidas || 0);
      setIntentosLoginFallidos(s.intentosLoginFallidos || 0);
      setTotalLogins(s.totalLogins || 0);
    } catch {}
  };

  // ---------------------------
  // EXPORTAR
  // ---------------------------
  const onConfirmExport = async (ok: boolean) => {
    if (!ok) return setMenu("formatoImport");

    try {
      const usuario = sessionStorage.getItem("konyx_user") || "desconocido";

      if (!ficheroSesiones) {
        alert("No se ha seleccionado el fichero de sesiones.");
        return;
      }

      const formExport = new FormData();
      formExport.append("formatoImport", formatoImport || "");
      formExport.append("formatoExport", formatoExport || "");
      formExport.append("empresa", empresa || "");
      formExport.append("fechaFactura", fechaFactura || "");
      formExport.append("proyecto", proyecto || "");
      formExport.append("cuenta", cuenta === "Otra (introducir)" ? cuentaOtra : cuenta || "");
      formExport.append("usuario", usuario);
      formExport.append("ficheroSesiones", ficheroSesiones);
      if (!usarUltimoContactos && ficheroContactos) {
        formExport.append("ficheroContactos", ficheroContactos);
      }

      console.log("🚀 Enviando ficheros y datos al backend...");
      const res = await fetch(`${BACKEND}/export/start`, {
        method: "POST",
        body: formExport,
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Error al iniciar exportación: ${msg}`);
      }

      console.log("✅ Exportación iniciada correctamente");
      setMenu("exportar");
      await refreshStats();
    } catch (e: any) {
      console.error("❌ Error en onConfirmExport:", e);
      alert("Error iniciando exportación: " + (e?.message || e));
    }
  };

  // ---------------------------
  // LOGOUT
  // ---------------------------
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
                "ficheroSesiones",
                "ficheroContactos",
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
                    : mk === "ficheroSesiones"
                    ? "Fichero sesiones"
                    : mk === "ficheroContactos"
                    ? "Fichero contactos"
                    : mk === "config"
                    ? "Configuración"
                    : mk === "about"
                    ? "Acerca de Konyx"
                    : "Cerrar Sesión"}
                </Item>
              ))}

              <button
                className={`w-full text-left px-3 py-2 rounded-lg font-semibold border transition ${
                  exportReady
                    ? "border-indigo-600 text-indigo-700 bg-white/90 shadow hover:bg-indigo-200 hover:text-indigo-800"
                    : "border-gray-300 text-gray-300 cursor-not-allowed"
                }`}
                onClick={() => exportReady && onConfirmExport(true)}
              >
                Exportar
              </button>
            </nav>
          </div>
        </aside>

        {/* Contenido */}
        <section className="flex flex-col space-y-6">
          {menu === "formatoImport" && <PanelOption title="Formato Importación" options={FORMATO_IMPORT_OPTS} value={formatoImport} onChange={setFormatoImport} />}
          {menu === "formatoExport" && <PanelOption title="Formato Exportación" options={FORMATO_EXPORT_OPTS} value={formatoExport} onChange={setFormatoExport} />}
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

          {/* FICHEROS */}
          {menu === "ficheroSesiones" && (
            <div className="border border-indigo-300 bg-indigo-50 rounded-xl p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-indigo-800 mb-3">Fichero de sesiones</h3>
              <PanelFile
                value={ficheroSesiones?.name || ""}
                onPickFileClick={onPickSesionesClick}
                onPickFile={onPickSesiones}
                fileInputRef={fileSesionesRef}
              />
            </div>
          )}

          {menu === "ficheroContactos" && (
            <div className="border border-indigo-300 bg-indigo-50 rounded-xl p-4 shadow-sm space-y-4">
              <h3 className="text-lg font-semibold text-indigo-800 mb-3">Fichero de contactos</h3>
              <PanelFileContactos
                value={ficheroContactos?.name || ""}
                onPickFileClick={onPickContactosClick}
                onPickFile={onPickContactos}
                fileInputRef={fileContactosRef}
                disabled={usarUltimoContactos}
              />
              <div className="flex items-center gap-2 bg-white rounded-lg border border-indigo-200 p-3">
                <input
                  id="usarUltimoContactos"
                  type="checkbox"
                  checked={usarUltimoContactos}
                  onChange={(e) => {
                    setUsarUltimoContactos(e.target.checked);
                    if (e.target.checked) {
                      setFicheroContactos(null);
                      if (fileContactosRef.current) fileContactosRef.current.value = "";
                    }
                  }}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="usarUltimoContactos" className="text-sm font-medium text-indigo-800">
                  Usar último fichero de contactos guardado
                </label>
              </div>
            </div>
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
                setApiKissoroVigente={setApiKissoroVigente}
                apiEnPluralVigente={apiEnPluralVigente}
                apiEnPluralNuevo={apiEnPluralNuevo}
                setApiEnPluralNuevo={setApiEnPluralNuevo}
                setApiEnPluralVigente={setApiEnPluralVigente}
                apiGroqVigente={apiGroqVigente}
                apiGroqNuevo={apiGroqNuevo}
                setApiGroqNuevo={setApiGroqNuevo}
                setApiGroqVigente={setApiGroqVigente}
              />

              <PanelDebug
                ultimoExport={ultimoExport}
                totalExportaciones={totalExportaciones}
                totalExportacionesFallidas={totalExportacionesFallidas}
                intentosLoginFallidos={intentosLoginFallidos}
                totalLogins={totalLogins}
                token={tokenActual}
              />
            </div>
          )}

          {menu === "about" && <PanelAbout />}
          {menu === "exportar" && <PanelExport onConfirm={onConfirmExport} onReset={() => setMenu("formatoImport")} />}
          {menu === "cerrar" && <PanelCerrar onConfirm={logout} onCancel={() => setMenu("formatoImport")} />}

          {/* Panel resumen */}
          {menu !== "config" && menu !== "exportar" && menu !== "about" && menu !== "cerrar" && (
            <PanelResumen
              formatoImport={formatoImport}
              formatoExport={formatoExport}
              empresa={empresa}
              fechaFactura={fechaFactura}
              proyecto={proyecto}
              cuenta={cuenta}
              cuentaOtra={cuentaOtra}
              ficheroSesiones={ficheroSesiones?.name || ""}
              ficheroContactos={usarUltimoContactos ? "(último guardado)" : ficheroContactos?.name || ""}
            />
          )}
        </section>
      </div>
    </main>
  );
}

