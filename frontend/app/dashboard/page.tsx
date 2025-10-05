"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Item } from "../components/Item";

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

  // -------------------- Hooks principales (nivel superior) --------------------
  const [authChecked, setAuthChecked] = useState(false);
  const [token, setToken] = useState<string | null>(null);

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

  const [passActual, setPassActual] = useState("");
  const [passNueva, setPassNueva] = useState("");
  const [passConfirma, setPassConfirma] = useState("");
  const [passMsg, setPassMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const [apiKissoroVigente, setApiKissoroVigente] = useState(process.env.NEXT_PUBLIC_API_KISSORO || "");
  const [apiKissoroNuevo, setApiKissoroNuevo] = useState("");
  const [apiKissoroMsg, setApiKissoroMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const [apiEnPluralVigente, setApiEnPluralVigente] = useState(process.env.NEXT_PUBLIC_API_ENPLURAL || "");
  const [apiEnPluralNuevo, setApiEnPluralNuevo] = useState("");
  const [apiEnPluralMsg, setApiEnPluralMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // -------------------- Validación de sesión --------------------
  useEffect(() => {
    const t = sessionStorage.getItem("konyx_token") || localStorage.getItem("konyx_token");
    if (!t) {
      // 🔹 Para pruebas temporales desactivamos el login
      setToken("dummy-token");
    } else {
      setToken(t);
    }
    setAuthChecked(true);
  }, []);

  if (!authChecked) return null;

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

  const onExportAsk = () => { if (exportReady) setMenu("exportar"); };

  const onConfirmExport = (ok: boolean) => {
    if (!ok) { setMenu("formatoImport"); return; }
    alert("Exportación iniciada (simulación).");
    setMenu("formatoImport");
  };

  const logout = () => {
    sessionStorage.removeItem("konyx_token");
    localStorage.removeItem("konyx_token");
    setFormatoImport(null); setFormatoExport(null); setEmpresa(null);
    setFechaFactura(""); setProyecto(null); setCuenta(null); setCuentaOtra("");
    setFicheroNombre(""); setMenu("formatoImport");
    router.replace("/");
  };

  // -------------------- JSX con placeholders seguros --------------------
  return (
    <main className="min-h-screen bg-no-repeat bg-center bg-cover p-4" style={{ backgroundImage: "url(/fondo.png)", backgroundSize: "100% 100%" }}>
      <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">

        {/* Sidebar */}
        <aside className="md:sticky md:top-6">
          <div className="bg-slate-500/90 backdrop-blur rounded-2xl shadow p-4">
            <div className="flex justify-center mb-4">
              <img src="/logo.png" alt="Konyx" className="h-48 w-auto drop-shadow-md" />
            </div>
            <nav className="space-y-2">
              {["formatoImport","formatoExport","empresa","fecha","proyecto","cuenta","fichero","config","cerrar"].map(mk => (
                <Item key={mk} active={menu===mk as MenuKey} onClick={()=>setMenu(mk as MenuKey)}>{mk}</Item>
              ))}
              <button className={`w-full text-left px-3 py-2 rounded-lg font-semibold border ${exportReady ? "border-indigo-600 text-indigo-700 bg-white/90" : "border-gray-300 text-gray-200 cursor-not-allowed"}`} onClick={onExportAsk}>
                Exportar
              </button>
            </nav>
          </div>
        </aside>

        {/* Contenido con placeholders */}
        <section className="space-y-6">
          <div className="bg-white/80 rounded-xl p-6 shadow-md">
            <h3 className="text-xl font-bold mb-4">Panel de prueba seguro</h3>
            <p>Este placeholder no usa hooks. Activa paneles reales uno a uno para test.</p>
          </div>
          <div className="bg-white/80 rounded-xl p-6 shadow-md">
            <h3 className="text-xl font-bold mb-4">Resumen Inferior (placeholder)</h3>
          </div>
        </section>

      </div>
    </main>
  );
}
