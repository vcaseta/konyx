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
  | "ficheros"
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
  const [formatoImport, setFormatoImport] = useState<typeof FORMATO_IMPORT_OPTS[number] | null>(null);
  const [formatoExport, setFormatoExport] = useState<typeof FORMATO_EXPORT_OPTS[number] | null>(null);
  const [empresa, setEmpresa] = useState<typeof EMPRESAS[number] | null>(null);
  const [fechaFactura, setFechaFactura] = useState("");
  const [proyecto, setProyecto] = useState<typeof PROYECTOS[number] | null>(null);
  const [cuenta, setCuenta] = useState<typeof CUENTAS[number] | null>(null);
  const [cuentaOtra, setCuentaOtra] = useState("");

  // Subida de archivos
  const fileSesionesRef = useRef<HTMLInputElement>(null);
  const fileContactosRef = useRef<HTMLInputElement>(null);
  const [fileSesionesName, setFileSesionesName] = useState("");
  const [fileContactosName, setFileContactosName] = useState("");

  // Exportación y progreso
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState<string[]>([]);
  const [exportDone, setExportDone] = useState(false);
  const [archivoGenerado, setArchivoGenerado] = useState<string | null>(null);

  const cuentaOk = cuenta === "Otra (introducir)" ? cuentaOtra.trim().length > 0 : !!cuenta;
  const exportReady =
    !!formatoImport &&
    !!formatoExport &&
    !!empresa &&
    !!fechaFactura &&
    !!proyecto &&
    cuentaOk &&
    !!fileSesionesName &&
    !!fileContactosName;

  // ---------------------------
  // FUNCIONES DE FICHEROS
  // ---------------------------
  const pickSesiones = () => fileSesionesRef.current?.click();
  const pickContactos = () => fileContactosRef.current?.click();

  const onSesionesPicked = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFileSesionesName(e.target.files?.[0]?.name || "");
  const onContactosPicked = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFileContactosName(e.target.files?.[0]?.name || "");

  // ---------------------------
  // 🚀 EXPORTAR DATOS
  // ---------------------------
  const onConfirmExport = async (ok: boolean) => {
    if (!ok) {
      setMenu("formatoImport");
      return;
    }

    setExporting(true);
    setProgress([]);
    setExportDone(false);
    setArchivoGenerado(null);

    try {
      const fileSesiones = fileSesionesRef.current?.files?.[0];
      const fileContactos = fileContactosRef.current?.files?.[0];
      if (!fileSesiones || !fileContactos) throw new Error("Faltan archivos para exportar.");

      // Construir FormData
      const formData = new FormData();
      formData.append("formatoImport", formatoImport || "");
      formData.append("formatoExport", formatoExport || "");
      formData.append("empresa", empresa || "");
      formData.append("fechaFactura", fechaFactura);
      formData.append("proyecto", proyecto || "");
      formData.append("cuenta", cuenta === "Otra (introducir)" ? cuentaOtra : cuenta || "");
      formData.append("usuario", sessionStorage.getItem("konyx_user") || "desconocido");
      formData.append("ficheroSesiones", fileSesiones);
      formData.append("ficheroContactos", fileContactos);

      // Iniciar el proceso de exportación
      const res = await fetch("http://192.168.1.51:8000/export/start", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Error iniciando exportación");
      const data = await res.json();
      setArchivoGenerado(data.archivo_generado);

      // 🔄 Escuchar el progreso en tiempo real (SSE)
      const evtSource = new EventSource("http://192.168.1.51:8000/export/progress");
      evtSource.onmessage = (event) => {
        const parsed = JSON.parse(event.data);
        if (parsed.step) setProgress((prev) => [...prev, parsed.step]);
      };
      evtSource.addEventListener("end", () => {
        evtSource.close();
        setExportDone(true);
        setExporting(false);
      });
    } catch (err) {
      console.error("❌ Error en exportación:", err);
      alert("Error al iniciar exportación.");
      setExporting(false);
    }
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
                "ficheros",
                "config",
                "about",
                "cerrar",
              ].map((mk) => (
                <Item
                  key={mk}
                  active={menu === mk}
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
                    ? "Fecha Factura"
                    : mk === "proyecto"
                    ? "Proyecto"
                    : mk === "cuenta"
                    ? "Cuenta Contable"
                    : mk === "ficheros"
                    ? "Ficheros de Datos"
                    : mk === "config"
                    ? "Configuración"
                    : mk === "about"
                    ? "Acerca de"
                    : "Cerrar Sesión"}
                </Item>
              ))}

              <button
                className={`w-full text-left px-3 py-2 rounded-lg font-semibold border transition ${
                  exportReady
                    ? "border-indigo-600 text-indigo-700 bg-white/90 shadow hover:bg-indigo-200 hover:text-indigo-800"
                    : "border-gray-300 text-gray-300 cursor-not-allowed"
                }`}
                onClick={() => exportReady && setMenu("exportar")}
              >
                Exportar
              </button>
            </nav>
          </div>
        </aside>

        {/* Panel de contenido */}
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
            <PanelOption title="Cuenta Contable" options={CUENTAS} value={cuenta} onChange={setCuenta}>
              {cuenta === "Otra (introducir)" && (
                <input
                  type="text"
                  value={cuentaOtra}
                  onChange={(e) => setCuentaOtra(e.target.value)}
                  placeholder="Introduce tu cuenta contable"
                  className="w-full rounded-lg border border-indigo-300 px-3 py-2 mt-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              )}
            </PanelOption>
          )}
          {menu === "fecha" && <PanelDate title="Fecha Factura" value={fechaFactura} onChange={setFechaFactura} />}

          {menu === "ficheros" && (
            <div className="space-y-6">
              <PanelFile value={fileSesionesName} onPickFileClick={pickSesiones} onPickFile={onSesionesPicked} fileInputRef={fileSesionesRef} />
              <PanelFile value={fileContactosName} onPickFileClick={pickContactos} onPickFile={onContactosPicked} fileInputRef={fileContactosRef} />
            </div>
          )}

          {menu === "exportar" && <PanelExport onConfirm={onConfirmExport} />}
          {menu === "config" && <PanelConfig /* ... igual que antes */ />}
          {menu === "about" && <PanelAbout />}
          {menu === "cerrar" && <PanelCerrar onConfirm={() => router.replace("/")} onCancel={() => setMenu("formatoImport")} />}

          {/* 🧩 Panel de resumen y progreso */}
          <div className="bg-blue-100/80 backdrop-blur-md rounded-2xl shadow-lg p-6 mt-4">
            <h4 className="font-bold text-xl mb-6 text-indigo-800 text-center">Panel de Resumen</h4>

            {exporting ? (
              <div className="space-y-3 text-center">
                <p className="font-semibold text-indigo-700">Procesando exportación...</p>
                <div className="bg-white rounded-xl p-4 shadow text-left max-h-60 overflow-y-auto">
                  {progress.map((p, i) => (
                    <p key={i} className="text-sm text-gray-800">• {p}</p>
                  ))}
                </div>
              </div>
            ) : exportDone && archivoGenerado ? (
              <div className="text-center space-y-3">
                <p className="text-green-700 font-semibold">✅ Exportación completada</p>
                <a
                  href={`http://192.168.1.51:8000/export/download/${archivoGenerado}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 underline"
                >
                  Descargar CSV generado
                </a>
              </div>
            ) : (
              <p className="text-gray-500 text-center">Aún no se ha realizado ninguna exportación.</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

