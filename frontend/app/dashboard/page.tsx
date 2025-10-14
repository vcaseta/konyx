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

  // Ficheros
  const [ficheroSesiones, setFicheroSesiones] = useState("");
  const [ficheroContactos, setFicheroContactos] = useState("");
  const fileSesionesRef = useRef<HTMLInputElement>(null);
  const fileContactosRef = useRef<HTMLInputElement>(null);

  // Configuración y APIs
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

  // Debug
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
    !!ficheroSesiones &&
    !!ficheroContactos;

  const onPickSesionesClick = () => fileSesionesRef.current?.click();
  const onPickContactosClick = () => fileContactosRef.current?.click();

  const onPickSesiones = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFicheroSesiones(e.target.files?.[0]?.name || "");
  const onPickContactos = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFicheroContactos(e.target.files?.[0]?.name || "");

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
  const handleExport = async () => {
    if (!exportReady) return alert("⚠️ Faltan datos o ficheros por seleccionar.");

    try {
      const usuario = sessionStorage.getItem("konyx_user") || "desconocido";
      const formData = new FormData();
      formData.append("formatoImport", formatoImport || "");
      formData.append("formatoExport", formatoExport || "");
      formData.append("empresa", empresa || "");
      formData.append("fechaFactura", fechaFactura || "");
      formData.append("proyecto", proyecto || "");
      formData.append("cuenta", cuenta === "Otra (introducir)" ? cuentaOtra : cuenta || "");
      formData.append("usuario", usuario);

      const fileSes = fileSesionesRef.current?.files?.[0];
      const fileCon = fileContactosRef.current?.files?.[0];
      if (!fileSes || !fileCon) {
        alert("⚠️ No se han seleccionado correctamente los ficheros de sesiones y/o contactos.");
        return;
      }

      formData.append("ficheroSesiones", fileSes);
      formData.append("ficheroContactos", fileCon);

      console.log("📤 Enviando exportación a backend...");
      const res = await fetch(`${BACKEND}/export/start`, { method: "POST", body: formData });
      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || "Error al iniciar exportación");
      }

      console.log("✅ Exportación iniciada correctamente");
      setMenu("exportar");
      await refreshStats();
    } catch (err) {
      console.error("❌ Error en handleExport:", err);
      alert("Error iniciando exportación. Revisa la consola.");
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
                onClick={handleExport}
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
          {menu === "ficheroSesiones" && (
            <PanelFile value={ficheroSesiones} onPickFileClick={onPickSesionesClick} onPickFile={onPickSesiones} fileInputRef={fileSesionesRef} />
          )}
          {menu === "ficheroContactos" && (
            <PanelFileContactos value={ficheroContactos} onPickFileClick={onPickContactosClick} onPickFile={onPickContactos} fileInputRef={fileContactosRef} />
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
          {menu === "exportar" && <PanelExport onReset={() => setMenu("formatoImport")} />}
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
              ficheroSesiones={ficheroSesiones}
              ficheroContactos={ficheroContactos}
            />
          )}
        </section>
      </div>
    </main>
  );
}

