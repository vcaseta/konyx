"use client";


import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/authContext";
import { PanelOption } from "../../components/PanelOption";
import { PanelDate } from "../../components/PanelDate";
import { PanelFile } from "../../components/PanelFile";
import { PanelConfig } from "../../components/PanelConfig";
import { PanelExport } from "../../components/PanelExport";
import { PanelCerrar } from "../../components/PanelCerrar";
import { ResumenInferior } from "../../components/ResumenInferior";
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
  | "exportar"
  | "cerrar";

export default function DashboardPage() {
  const { token, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !token) router.replace("/");
  }, [token, loading, router]);

  if (loading || !token) return null;

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

  // ---------------- Contraseña ----------------
  const [passActual, setPassActual] = useState("");
  const [passNueva, setPassNueva] = useState("");
  const [passConfirma, setPassConfirma] = useState("");
  const [passMsg, setPassMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [passwordGlobal, setPasswordGlobal] = useState("1234"); // contraseña inicial

  // ---------------- APIs ----------------
  const [apiKissoroVigente, setApiKissoroVigente] = useState(process.env.NEXT_PUBLIC_API_KISSORO || "");
  const [apiKissoroNuevo, setApiKissoroNuevo] = useState("");
  const [apiKissoroMsg, setApiKissoroMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const [apiEnPluralVigente, setApiEnPluralVigente] = useState(process.env.NEXT_PUBLIC_API_ENPLURAL || "");
  const [apiEnPluralNuevo, setApiEnPluralNuevo] = useState("");
  const [apiEnPluralMsg, setApiEnPluralMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // ---------------- Funciones ----------------
  const onPickFileClick = () => fileInputRef.current?.click();
  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFicheroNombre(e.target.files?.[0]?.name || "");

  const cuentaOk = cuenta === "Otra (introducir)" ? cuentaOtra.trim().length > 0 : !!cuenta;
  const exportReady =
    !!formatoImport && !!formatoExport && !!empresa && !!fechaFactura && !!proyecto && cuentaOk && !!ficheroNombre;

  const onExportAsk = () => { if (exportReady) setMenu("exportar"); };
  const onConfirmExport = (ok: boolean) => {
    if (!ok) { setMenu("formatoImport"); return; }
    alert("Exportación iniciada (simulación)");
    setMenu("formatoImport");
  };

  const logout = () => {
    sessionStorage.removeItem("konyx_token");
    localStorage.removeItem("konyx_token");
    router.replace("/");
  };

  // ---------------- JSX ----------------
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
              <img src="/logo.png" alt="Konyx" className="h-16 w-auto drop-shadow-md" />
            </div>
            <nav className="space-y-2">
              {["formatoImport","formatoExport","empresa","fecha","proyecto","cuenta","fichero","config","cerrar"].map(mk => (
                <Item
                  key={mk}
                  active={menu===mk as MenuKey}
                  onClick={()=>setMenu(mk as MenuKey)}
                  className="hover:bg-indigo-200 hover:text-indigo-800 transition"
                >
                  {mk === "formatoImport" ? "Formato Importación" :
                   mk === "formatoExport" ? "Formato Exportación" :
                   mk === "empresa" ? "Empresa" :
                   mk === "fecha" ? "Fecha factura" :
                   mk === "proyecto" ? "Proyecto" :
                   mk === "cuenta" ? "Cuenta contable" :
                   mk === "fichero" ? "Fichero de datos" :
                   mk === "config" ? "Configuración" :
                   mk === "cerrar" ? "Cerrar Sesión" : mk}
                </Item>
              ))}
              <button
                className={`w-full text-left px-3 py-2 rounded-lg font-semibold border transition
                  ${exportReady ? "border-indigo-600 text-indigo-700 bg-white/90 shadow hover:bg-indigo-200 hover:text-indigo-800" : "border-gray-300 text-gray-200 cursor-not-allowed"}`}
                onClick={onExportAsk}
              >
                Exportar
              </button>
            </nav>
          </div>
        </aside>

        {/* Contenido derecho */}
        <section className="flex flex-col space-y-6">
          {menu === "formatoImport" && <PanelOption title="Formato Importación" options={FORMATO_IMPORT_OPTS} value={formatoImport} onChange={setFormatoImport} />}
          {menu === "formatoExport" && <PanelOption title="Formato Exportación" options={FORMATO_EXPORT_OPTS} value={formatoExport} onChange={setFormatoExport} />}
          {menu === "empresa" && <PanelOption title="Empresa" options={EMPRESAS} value={empresa} onChange={setEmpresa} />}
          {menu === "proyecto" && <PanelOption title="Proyecto" options={PROYECTOS} value={proyecto} onChange={setProyecto} />}
          {menu === "cuenta" &&
            <PanelOption title="Cuenta contable" options={CUENTAS} value={cuenta} onChange={setCuenta}>
              {cuenta==="Otra (introducir)" &&
                <input type="text" value={cuentaOtra} onChange={e=>setCuentaOtra(e.target.value)} placeholder="Introduce tu cuenta" className="w-full rounded-lg border border-indigo-300 px-3 py-2 mt-4 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              }
            </PanelOption>
          }
          {menu === "fecha" && <PanelDate title="Fecha factura" value={fechaFactura} onChange={setFechaFactura} />}
          {menu === "fichero" && <PanelFile value={ficheroNombre} onPickFile={onPickFile} onPickFileClick={onPickFileClick} fileInputRef={fileInputRef} />}
          
          {menu === "config" && <PanelConfig
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
            apiKissoroMsg={apiKissoroMsg}
            apiEnPluralVigente={apiEnPluralVigente}
            apiEnPluralNuevo={apiEnPluralNuevo}
            setApiEnPluralNuevo={setApiEnPluralNuevo}
            apiEnPluralMsg={apiEnPluralMsg}
            onCambioApis={() => {}}
          />}

          {menu === "exportar" && <PanelExport onConfirm={onConfirmExport} />}
          {menu === "cerrar" && <PanelCerrar onConfirm={logout} onCancel={()=>setMenu("formatoImport")} />}

          <ResumenInferior />
        </section>
      </div>
    </main>
  );
}

