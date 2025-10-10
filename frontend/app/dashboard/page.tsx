"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/authContext";

import PanelOption from "../../components/PanelOption";
import { PanelDate } from "../../components/PanelDate";
import { PanelFile } from "../../components/PanelFile";
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
  | "ficheroSesiones"
  | "ficheroContactos"
  | "debug"
  | "about"
  | "exportar"
  | "cerrar";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.51:8000";

export default function DashboardPage() {
  const { token, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loading && !token) router.replace("/");
  }, [token, loading, router]);
  if (loading || !token) return null;

  // -----------------------
  // Estados principales
  // -----------------------
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

  const [ultimoExport, setUltimoExport] = useState("-");
  const [totalExportaciones, setTotalExportaciones] = useState(0);
  const [totalExportacionesFallidas, setTotalExportacionesFallidas] = useState(0);
  const [intentosLoginFallidos, setIntentosLoginFallidos] = useState(0);

  const [exportStatus, setExportStatus] = useState<{
    visible: boolean;
    logs: string[];
    finished?: boolean;
    error?: string;
    downloadUrl?: string;
  } | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${BACKEND}/auth/status`);
        if (!res.ok) throw new Error("Error al sincronizar estado");
        const data = await res.json();
        setUltimoExport(data.ultimoExport || "-");
        setTotalExportaciones(data.totalExportaciones || 0);
        setTotalExportacionesFallidas(data.totalExportacionesFallidas || 0);
        setIntentosLoginFallidos(data.intentosLoginFallidos || 0);
      } catch (e) {
        console.error(e);
      }
    };
    fetchStats();
  }, []);

  // -----------------------
  // Condiciones de exportar
  // -----------------------
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

  // -----------------------
  // Ficheros
  // -----------------------
  const onPickSesionesClick = () => fileSesionesRef.current?.click();
  const onPickContactosClick = () => fileContactosRef.current?.click();
  const onPickSesiones = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFicheroSesiones(e.target.files?.[0]?.name || "");
  const onPickContactos = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFicheroContactos(e.target.files?.[0]?.name || "");

  // -----------------------
  // Exportar
  // -----------------------
  const onConfirmExport = async (ok: boolean) => {
    if (!ok) return setMenu("formatoImport");
    setExportStatus({ visible: true, logs: ["🔄 Iniciando exportación..."] });

    try {
      const formData = new FormData();
      formData.append("formatoImport", formatoImport!);
      formData.append("formatoExport", formatoExport!);
      formData.append("empresa", empresa!);
      formData.append("fechaFactura", fechaFactura);
      formData.append("proyecto", proyecto!);
      formData.append("cuenta", cuenta === "Otra (introducir)" ? cuentaOtra : cuenta!);
      formData.append("usuario", sessionStorage.getItem("konyx_user") || "desconocido");

      const fileSes = fileSesionesRef.current?.files?.[0];
      const fileCon = fileContactosRef.current?.files?.[0];
      if (!fileSes || !fileCon) throw new Error("Debes seleccionar ambos ficheros");

      formData.append("ficheroSesiones", fileSes);
      formData.append("ficheroContactos", fileCon);

      // Disparo el proceso en el backend
      const res = await fetch(`${BACKEND}/export/start`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      const csvUrl = `${BACKEND}/export/download/${data.archivo_generado}`;

      // Conectar SSE (progreso + correcciones GPT)
      const es = new EventSource(`${BACKEND}/export/progress`);
      es.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        setExportStatus((prev) => (prev ? { ...prev, logs: [...prev.logs, msg.step] } : prev));
      };
      es.addEventListener("end", () => {
        es.close();
        setExportStatus((prev) => prev && { ...prev, finished: true, downloadUrl: csvUrl });
      });

      // Actualizo métricas del panel
      setUltimoExport(data.ultimoExport);
      setTotalExportaciones(data.totalExportaciones);
    } catch (err: any) {
      console.error(err);
      setExportStatus({
        visible: true,
        logs: ["❌ Error en la exportación"],
        error: err.message || "Error desconocido",
      });
    } finally {
      setMenu("formatoImport");
    }
  };

  // -----------------------
  // Logout
  // -----------------------
  const logout = () => {
    sessionStorage.removeItem("konyx_token");
    router.replace("/");
  };

  // -----------------------
  // Render
  // -----------------------
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
                "debug",
                "about",
                "cerrar",
              ].map((mk) => (
                <Item
                  key={mk}
                  active={menu === (mk as MenuKey)}
                  onClick={() => setMenu(mk as MenuKey)}
                  className="hover:bg-indigo-200 hover:text-indigo-800 transition"
                >
                  {mk === "ficheroSesiones"
                    ? "Fichero sesiones"
                    : mk === "ficheroContactos"
                    ? "Fichero contactos"
                    : mk.charAt(0).toUpperCase() + mk.slice(1)}
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

        {/* Contenido */}
        <section className="flex flex-col space-y-6">
          {menu === "formatoImport" && (
            <PanelOption
              title="Formato Importación"
              options={FORMATO_IMPORT_OPTS}
              value={formatoImport}
              onChange={setFormatoImport}
            />
          )}
          {menu === "formatoExport" && (
            <PanelOption
              title="Formato Exportación"
              options={FORMATO_EXPORT_OPTS}
              value={formatoExport}
              onChange={setFormatoExport}
            />
          )}
          {menu === "empresa" && (
            <PanelOption title="Empresa" options={EMPRESAS} value={empresa} onChange={setEmpresa} />
          )}
          {menu === "fecha" && (
            <PanelDate title="Fecha factura" value={fechaFactura} onChange={setFechaFactura} />
          )}
          {menu === "proyecto" && (
            <PanelOption title="Proyecto" options={PROYECTOS} value={proyecto} onChange={setProyecto} />
          )}
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
          {menu === "ficheroSesiones" && (
            <PanelFile
              value={ficheroSesiones}
              onPickFileClick={onPickSesionesClick}
              onPickFile={onPickSesiones}
              fileInputRef={fileSesionesRef}
            />
          )}
          {menu === "ficheroContactos" && (
            <PanelFile
              value={ficheroContactos}
              onPickFileClick={onPickContactosClick}
              onPickFile={onPickContactos}
              fileInputRef={fileContactosRef}
            />
          )}
          {menu === "debug" && (
            <PanelDebug
              ultimoExport={ultimoExport}
              totalExportaciones={totalExportaciones}
              totalExportacionesFallidas={totalExportacionesFallidas}
              intentosLoginFallidos={intentosLoginFallidos}
            />
          )}
          {menu === "about" && <PanelAbout />}
          {menu === "exportar" && <PanelExport onConfirm={onConfirmExport} />}
          {menu === "cerrar" && <PanelCerrar onConfirm={logout} onCancel={() => setMenu("formatoImport")} />}
        </section>
      </div>

      {/* ---------------------- */}
      {/* 🪄 MODAL DE PROGRESO */}
      {/* ---------------------- */}
      {exportStatus?.visible && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-md text-center">
            <h3 className="text-xl font-bold text-indigo-700 mb-4">
              {exportStatus.error
                ? "❌ Error en la exportación"
                : exportStatus.finished
                ? "✅ Exportación completada"
                : "⚙️ Procesando exportación..."}
            </h3>

            {/* Logs (incluye cambios de GPT) */}
            <div className="bg-gray-100 rounded-lg p-3 text-left max-h-60 overflow-y-auto mb-4">
              {exportStatus.logs.map((log, i) => (
                <div key={i} className="text-sm text-gray-700 mb-1">
                  {log}
                </div>
              ))}
            </div>

            {/* Spinner y barra */}
            {!exportStatus.finished && !exportStatus.error && (
              <div className="flex flex-col items-center space-y-3 mb-4">
                <div className="w-10 h-10 border-4 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-2 transition-all duration-500"
                    style={{ width: `${Math.min(exportStatus.logs.length * 10 + 10, 100)}%` }}
                  />
                </div>
                <div className="text-indigo-600 font-semibold animate-pulse">
                  {exportStatus.logs[exportStatus.logs.length - 1] || "Procesando..."}
                </div>
              </div>
            )}

            {/* Error */}
            {exportStatus.error && (
              <>
                <div className="text-red-600 font-semibold mb-3">{exportStatus.error}</div>
                <button
                  onClick={() => setExportStatus(null)}
                  className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500"
                >
                  Cerrar
                </button>
              </>
            )}

            {/* Finalizado */}
            {exportStatus.finished && exportStatus.downloadUrl && (
              <div className="flex flex-col space-y-3">
                <a
                  href={exportStatus.downloadUrl}
                  target="_blank"
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                >
                  ⬇️ Descargar CSV generado
                </a>
                <button
                  onClick={() => setExportStatus(null)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                >
                  Cerrar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
