"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  PanelOption,
  PanelDate,
  PanelFile,
  PanelConfig,
  PanelExport,
  PanelCerrar,
  ResumenInferior,
  Item,
} from "./components";

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
  const router = useRouter();

  // -------------------- Autenticación --------------------
  const [authChecked, setAuthChecked] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const t = sessionStorage.getItem("konyx_session");
    if (!t) router.replace("/");
    else {
      setToken(t);
      setAuthChecked(true);
    }
  }, [router]);

  if (!authChecked) return null;

  // -------------------- Estados del dashboard --------------------
  const [menu, setMenu] = useState<MenuKey>("formatoImport");

  const [formatoImport, setFormatoImport] = useState<typeof FORMATO_IMPORT_OPTS[number] | null>(null);
  const [formatoExport, setFormatoExport] = useState<typeof FORMATO_EXPORT_OPTS[number] | null>(null);
  const [empresa, setEmpresa] = useState<typeof EMPRESAS[number] | null>(null);
  const [fechaFactura, setFechaFactura] = useState("");
  const [proyecto, setProyecto] = useState<typeof PROYECTOS[number] | null>(null);
  const [cuenta, setCuenta] = useState<typeof CUENTAS[number] | null>(null);
  const [cuentaOtra, setCuentaOtra] = useState("");
  const [ficheroNombre, setFicheroNombre] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null); // ✅ ref global

  // Configuración: contraseña
  const [passActual, setPassActual] = useState("");
  const [passNueva, setPassNueva] = useState("");
  const [passConfirma, setPassConfirma] = useState("");
  const [passMsg, setPassMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Configuración: APIs
  const [apiKissoroVigente, setApiKissoroVigente] = useState(process.env.NEXT_PUBLIC_API_KISSORO || "");
  const [apiKissoroNuevo, setApiKissoroNuevo] = useState("");
  const [apiKissoroMsg, setApiKissoroMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const [apiEnPluralVigente, setApiEnPluralVigente] = useState(process.env.NEXT_PUBLIC_API_ENPLURAL || "");
  const [apiEnPluralNuevo, setApiEnPluralNuevo] = useState("");
  const [apiEnPluralMsg, setApiEnPluralMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // -------------------- Funciones --------------------
  const onPickFileClick = () => fileInputRef.current?.click();
  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    setFicheroNombre(f ? f.name : "");
  };

  const exportReady = useMemo(() => {
    const cuentaOk = cuenta === "Otra (introducir)" ? cuentaOtra.trim().length > 0 : !!cuenta;
    return !!formatoImport && !!formatoExport && !!empresa && !!fechaFactura && !!proyecto && cuentaOk && !!ficheroNombre;
  }, [formatoImport, formatoExport, empresa, fechaFactura, proyecto, cuenta, cuentaOtra, ficheroNombre]);

  const onExportAsk = () => {
    if (exportReady) setMenu("exportar");
  };

  const onConfirmExport = (ok: boolean) => {
    if (!ok) {
      setMenu("formatoImport");
      return;
    }
    alert("Exportación iniciada (conectaremos backend después).");
    setMenu("formatoImport");
  };

  const onCambioApis = async () => {
    setApiKissoroMsg(null);
    setApiEnPluralMsg(null);
    if (!token) return;
    try {
      const res = await fetch("/auth/apis", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ kissoro: apiKissoroNuevo || apiKissoroVigente, enplural: apiEnPluralNuevo || apiEnPluralVigente }),
      });
      if (!res.ok) throw new Error("Error al actualizar APIs");
      setApiKissoroVigente(apiKissoroNuevo || apiKissoroVigente);
      setApiEnPluralVigente(apiEnPluralNuevo || apiEnPluralVigente);
      setApiKissoroNuevo("");
      setApiEnPluralNuevo("");
      setApiKissoroMsg({ type: "ok", text: "API Kissoro actualizado." });
      setApiEnPluralMsg({ type: "ok", text: "API En Plural actualizado." });
    } catch (error: any) {
      setApiKissoroMsg({ type: "err", text: error.message });
      setApiEnPluralMsg({ type: "err", text: error.message });
    }
  };

  const onCambioPassword = async () => {
    setPassMsg(null);
    if (!token) return;
    if (!passActual || !passNueva || !passConfirma) {
      setPassMsg({ type: "err", text: "Rellena todos los campos" });
      return;
    }
    if (passNueva !== passConfirma) {
      setPassMsg({ type: "err", text: "La nueva contraseña y su confirmación no coinciden." });
      return;
    }
    try {
      const res = await fetch("/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ old_password: passActual, new_password: passNueva }),
      });
      if (!res.ok) throw new Error("Error al cambiar contraseña");
      setPassMsg({ type: "ok", text: "Contraseña actualizada correctamente" });
      setPassActual("");
      setPassNueva("");
      setPassConfirma("");
    } catch (error: any) {
      setPassMsg({ type: "err", text: error.message });
    }
  };

  const logout = () => {
    sessionStorage.removeItem("konyx_session");
    router.replace("/");
  };

  const fmtFecha = (fechaIso: string) => {
    if (!fechaIso) return "—";
    const d = new Date(fechaIso + "T00:00");
    if (Number.isNaN(d.getTime())) return "—";
    return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
  };

  // -------------------- JSX principal --------------------
  return (
    <main className="min-h-screen bg-no-repeat bg-center bg-cover p-4" style={{ backgroundImage: "url(/fondo.png)", backgroundSize: "100% 100%", backgroundRepeat: "no-repeat" }}>
      <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
        {/* Sidebar */}
        <aside className="md:sticky md:top-6">
          <div className="bg-slate-500/90 backdrop-blur rounded-2xl shadow p-4">
            <div className="flex justify-center mb-4">
              <img src="/logo.png" alt="Konyx" className="h-48 w-auto drop-shadow-md" />
            </div>
            <nav className="space-y-2">
              <Item active={menu === "formatoImport"} onClick={() => setMenu("formatoImport")}>Formato Importación</Item>
              <Item active={menu === "formatoExport"} onClick={() => setMenu("formatoExport")}>Formato Exportación</Item>
              <Item active={menu === "empresa"} onClick={() => setMenu("empresa")}>Empresa</Item>
              <Item active={menu === "fecha"} onClick={() => setMenu("fecha")}>Fecha factura</Item>
              <Item active={menu === "proyecto"} onClick={() => setMenu("proyecto")}>Proyecto</Item>
              <Item active={menu === "cuenta"} onClick={() => setMenu("cuenta")}>Cuenta contable</Item>
              <Item active={menu === "fichero"} onClick={() => setMenu("fichero")}>Fichero de datos</Item>
              <Item active={menu === "config"} onClick={() => setMenu("config")}>Configuración</Item>
              <button
                type="button"
                onClick={onExportAsk}
                className={`w-full text-left px-3 py-2 rounded-lg transition font-semibold border ${exportReady ? "border-indigo-600 text-indigo-700 bg-white/90 shadow hover:bg-indigo-200 hover:text-indigo-800" : "border-gray-300 text-gray-200 cursor-not-allowed"}`}
                title={exportReady ? "Listo para exportar" : "Completa todos los campos para exportar"}
              >
                Exportar
              </button>
              <div className="pt-2">
                <Item active={menu === "cerrar"} onClick={() => setMenu("cerrar")}>Cerrar Sesión</Item>
              </div>
            </nav>
          </div>
        </aside>

        {/* Contenido principal */}
        <section className="space-y-6">
          {menu === "formatoImport" && <PanelOption title="Formato Importación" options={FORMATO_IMPORT_OPTS} value={formatoImport} onChange={setFormatoImport} />}
          {menu === "formatoExport" && <PanelOption title="Formato Exportación" options={FORMATO_EXPORT_OPTS} value={formatoExport} onChange={setFormatoExport} />}
          {menu === "empresa" && <PanelOption title="Empresa" options={EMPRESAS} value={empresa} onChange={setEmpresa} />}
          {menu === "proyecto" && <PanelOption title="Proyecto" options={PROYECTOS} value={proyecto} onChange={setProyecto} />}
          {menu === "cuenta" && <PanelOption title="Cuenta contable" options={CUENTAS} value={cuenta} onChange={setCuenta}>
            {cuenta === "Otra (introducir)" && <div className="mt-4">
              <input type="text" value={cuentaOtra} onChange={e => setCuentaOtra(e.target.value)} placeholder="Introduce tu cuenta" className="w-full rounded-lg border border-indigo-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>}
          </PanelOption>}
          {menu === "fecha" && <PanelDate title="Fecha factura" value={fechaFactura} onChange={setFechaFactura} />}
          {menu === "fichero" && <PanelFile value={ficheroNombre} onPickFile={onPickFile} onPickFileClick={onPickFileClick} fileInputRef={fileInputRef} />}
          {menu === "config" && <PanelConfig
            passActual={passActual} passNueva={passNueva} passConfirma={passConfirma}
            setPassActual={setPassActual} setPassNueva={setPassNueva} setPassConfirma={setPassConfirma} passMsg={passMsg} onCambioPassword={onCambioPassword}
            apiKissoroVigente={apiKissoroVigente} apiKissoroNuevo={apiKissoroNuevo} setApiKissoroNuevo={setApiKissoroNuevo} apiKissoroMsg={apiKissoroMsg}
            apiEnPluralVigente={apiEnPluralVigente} apiEnPluralNuevo={apiEnPluralNuevo} setApiEnPluralNuevo={setApiEnPluralNuevo} apiEnPluralMsg={apiEnPluralMsg} onCambioApis={onCambioApis}
          />}
          {menu === "exportar" && <PanelExport onConfirm={onConfirmExport} />}
          {menu === "cerrar" && <PanelCerrar onConfirm={logout} onCancel={() => setMenu("formatoImport")} />}

          <ResumenInferior />
        </section>
      </div>
    </main>
  );
}
