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

  const [ficheroSesiones, setFicheroSesiones] = useState("");
  const [ficheroContactos, setFicheroContactos] = useState("");
  const fileSesionesRef = useRef<HTMLInputElement>(null);
  const fileContactosRef = useRef<HTMLInputElement>(null);

  const [passwordGlobal, setPasswordGlobal] = useState(() => sessionStorage.getItem("konyx_password") || "1234");

  // APIs
  const [apiKissoroVigente, setApiKissoroVigente] = useState(() => localStorage.getItem("apiKissoro") || "");
  const [apiEnPluralVigente, setApiEnPluralVigente] = useState(() => localStorage.getItem("apiEnPlural") || "");
  const [apiGroqVigente, setApiGroqVigente] = useState(() => localStorage.getItem("apiGroq") || "");
  const [tokenActual, setTokenActual] = useState(() => sessionStorage.getItem("konyx_token") || "");

  // Debug e histórico
  const [ultimoExport, setUltimoExport] = useState("-");
  const [totalExportaciones, setTotalExportaciones] = useState(0);
  const [totalExportacionesFallidas, setTotalExportacionesFallidas] = useState(0);
  const [intentosLoginFallidos, setIntentosLoginFallidos] = useState(0);

  // Estado exportación
  const [exportStatus, setExportStatus] = useState<
    | null
    | {
        visible: boolean;
        logs: string[];
        finished?: boolean;
        error?: string;
      }
  >(null);

  // ---------------------------
  // UTILIDADES
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

  const onPickSesiones = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.files?.[0]?.name || "";
    setFicheroSesiones(name);
  };
  const onPickContactos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.files?.[0]?.name || "";
    setFicheroContactos(name);
  };

  // 🔁 Sincronización inicial
  useEffect(() => {
    const fetchBackendData = async () => {
      try {
        const res = await fetch(`${BACKEND}/auth/status`);
        if (!res.ok) throw new Error("Error al sincronizar backend");
        const data = await res.json();

        setPasswordGlobal(data.password || "1234");
        sessionStorage.setItem("konyx_password", data.password || "1234");

        setApiKissoroVigente(data.apiKissoro || "");
        setApiEnPluralVigente(data.apiEnPlural || "");
        setApiGroqVigente(data.apiGroq || "");

        setUltimoExport(data.ultimoExport || "-");
        setTotalExportaciones(data.totalExportaciones || 0);
        setTotalExportacionesFallidas(data.totalExportacionesFallidas || 0);
        setIntentosLoginFallidos(data.intentosLoginFallidos || 0);
      } catch (err) {
        console.error("Error sincronizando con backend:", err);
      }
    };
    fetchBackendData();
  }, []);

  // 🚀 Exportar con SSE en tiempo real
  const onConfirmExport = async (ok: boolean) => {
    if (!ok) {
      setMenu("formatoImport");
      return;
    }

    setExportStatus({ visible: true, logs: ["Iniciando exportación..."] });

    try {
      const usuario = sessionStorage.getItem("konyx_user") || "desconocido";

      const formData = new FormData();
      formData.append("formatoImport", formatoImport!);
      formData.append("formatoExport", formatoExport!);
      formData.append("empresa", empresa!);
      formData.append("fechaFactura", fechaFactura);
      formData.append("proyecto", proyecto!);
      formData.append("cuenta", cuenta === "Otra (introducir)" ? cuentaOtra : (cuenta as string));
      formData.append("usuario", usuario);

      const fileSes = fileSesionesRef.current?.files?.[0];
      const fileCon = fileContactosRef.current?.files?.[0];
      if (!fileSes || !fileCon) throw new Error("Faltan archivos: sesiones y/o contactos.");

      formData.append("ficheroSesiones", fileSes);
      formData.append("ficheroContactos", fileCon);

      const res = await fetch(`${BACKEND}/export/start`, { method: "POST", body: formData });
      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();
      const exportId = data.export_id;

      setExportStatus((prev) =>
        prev && { ...prev, logs: [...prev.logs, "✅ Ficheros subidos. Esperando progreso..."] }
      );

      const eventSource = new EventSource(`${BACKEND}/export/progress/${exportId}`);
      eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.step) {
            setExportStatus((prev) =>
              prev && { ...prev, logs: [...prev.logs, parsed.step] }
            );
          }
        } catch {
          /* ignorar */
        }
      };
      eventSource.addEventListener("end", () => {
        eventSource.close();
        setExportStatus((prev) =>
          prev && { ...prev, logs: [...prev.logs, "🟢 Exportación completada."], finished: true }
        );
      });
      eventSource.onerror = () => {
        eventSource.close();
        setExportStatus((prev) =>
          prev && { ...prev, logs: [...prev.logs, "❌ Error en stream SSE"], error: "Error SSE" }
        );
      };
    } catch (err: any) {
      console.error("❌ Error exportando:", err);
      setExportStatus({
        visible: true,
        logs: ["❌ Error durante la exportación."],
        error: err?.message || "Error desconocido",
      });
    } finally {
      setMenu("formatoImport");
    }
  };

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
                    : "border-gray-300 text-gray-200 cursor-not-allowed"
                }`}
                onClick={() => exportReady && setMenu("exportar")}
              >
                Exportar
              </button>
            </nav>
          </div>
        </aside>

        {/* Contenido principal */}
        <section className="flex flex-col space-y-6">
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
      apiKissoro={apiKissoroVigente}
      apiEnPlural={apiEnPluralVigente}
      apiGroq={apiGroqVigente}
      token={token}
    />
  </div>
          ) : menu === "about" ? (
            <PanelAbout />
          ) : menu === "exportar" ? (
            <PanelExport onConfirm={onConfirmExport} />
          ) : menu === "cerrar" ? (
            <PanelCerrar onConfirm={logout} onCancel={() => setMenu("formatoImport")} />
          ) : (
            <>
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
              {menu === "ficheroSesiones" && (
                <PanelFile value={ficheroSesiones} onPickFileClick={onPickSesionesClick} onPickFile={onPickSesiones} fileInputRef={fileSesionesRef} />
              )}
              {menu === "ficheroContactos" && (
                <PanelFileContactos
                  value={ficheroContactos}
                  onPickFileClick={onPickContactosClick}
                  onPickFile={onPickContactos}
                  fileInputRef={fileContactosRef}
                />
              )}
            </>
          )}
        </section>
      </div>

      {/* Modal progreso */}
      {exportStatus?.visible && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-md text-center">
            <h3 className="text-xl font-bold text-indigo-700 mb-4">Exportando datos...</h3>

            <div className="bg-gray-100 rounded-lg p-3 text-left max-h-60 overflow-y-auto mb-4">
              {exportStatus.logs.map((log, i) => (
                <div key={i} className="text-sm text-gray-700 mb-1">
                  {log}
                </div>
              ))}
            </div>

            {!exportStatus.finished && !exportStatus.error && (
              <div className="text-indigo-600 font-semibold animate-pulse">Procesando...</div>
            )}

            {exportStatus.finished && !exportStatus.error && (
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setExportStatus(null)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    setFormatoImport(null);
                    setFormatoExport(null);
                    setEmpresa(null);
                    setFechaFactura("");
                    setProyecto(null);
                    setCuenta(null);
                    setCuentaOtra("");
                    setFicheroSesiones("");
                    setFicheroContactos("");
                    if (fileSesionesRef.current) fileSesionesRef.current.value = "";
                    if (fileContactosRef.current) fileContactosRef.current.value = "";
                    setMenu("formatoImport");
                    setExportStatus(null);
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                >
                  Nueva Exportación
                </button>
              </div>
            )}

            {exportStatus.error && <div className="text-red-600 font-semibold mt-2">{exportStatus.error}</div>}
          </div>
        </div>
      )}
    </main>
  );
}

