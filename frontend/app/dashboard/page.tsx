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

  // -------------------- CORRECCIÓN AQUÍ --------------------
  const fileInputRef = useRef<HTMLInputElement>(null!); // Antes era: useRef<HTMLInputElement | null>(null)

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
        {/* ...todo el resto del JSX queda igual... */}
        <section className="space-y-6">
          {menu === "fichero" && <PanelFile value={ficheroNombre} onPickFile={onPickFile} onPickFileClick={onPickFileClick} fileInputRef={fileInputRef} />}
          {/* ... resto de condicionales */}
        </section>
      </div>
    </main>
  );
}

