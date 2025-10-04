"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

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

const FORMATO_IMPORT_OPTS = ["Eholo", "Gestoria"] as const;
const FORMATO_EXPORT_OPTS = ["Holded", "Gestoria"] as const;
const EMPRESAS = ["Kissoro", "En Plural Psicologia"] as const;
const PROYECTOS = ["Servicios de Psicologia", "Formacion", "Administracion SL"] as const;
const CUENTAS = [
  "70500000 Prestaciones de servicios",
  "70000000 Venta de mercaderías",
  "Otra (introducir)",
] as const;

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const t = sessionStorage.getItem("token");
    if (!t) router.replace("/");
  }, [router]);

  const [menu, setMenu] = useState<MenuKey>("formatoImport");

  const [formatoImport, setFormatoImport] = useState<(typeof FORMATO_IMPORT_OPTS)[number] | null>(
    null
  );
  const [formatoExport, setFormatoExport] = useState<(typeof FORMATO_EXPORT_OPTS)[number] | null>(
    null
  );
  const [empresa, setEmpresa] = useState<(typeof EMPRESAS)[number] | null>(null);
  const [fechaFactura, setFechaFactura] = useState<string>("");
  const [proyecto, setProyecto] = useState<(typeof PROYECTOS)[number] | null>(null);
  const [cuenta, setCuenta] = useState<(typeof CUENTAS)[number] | null>(null);
  const [cuentaOtra, setCuentaOtra] = useState<string>("");
  const [ficheroNombre, setFicheroNombre] = useState<string>("");

  const [passActual, setPassActual] = useState("");
  const [passNueva, setPassNueva] = useState("");
  const [passConfirma, setPassConfirma] = useState("");
  const [apiKissoroVigente, setApiKissoroVigente] = useState("");
  const [apiKissoroNuevo, setApiKissoroNuevo] = useState("");
  const [apiEnPluralVigente, setApiEnPluralVigente] = useState("");
  const [apiEnPluralNuevo, setApiEnPluralNuevo] = useState("");

  useEffect(() => {
    setApiKissoroVigente("sk_test_kissoro123");
    setApiEnPluralVigente("sk_test_enplural456");
  }, []);

  useEffect(() => {
    if (sessionStorage.getItem("reset-dashboard-state") === "1") {
      setMenu("formatoImport");
      setFormatoImport(null);
      setFormatoExport(null);
      setEmpresa(null);
      setFechaFactura("");
      setProyecto(null);
      setCuenta(null);
      setCuentaOtra("");
      setFicheroNombre("");
      sessionStorage.removeItem("reset-dashboard-state");
    }
  }, []);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const onPickFile = () => fileInputRef.current?.click();
  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) setFicheroNombre(f.name);
  }

  const exportReady = useMemo(() => {
    const cuentaOk =
      cuenta === "Otra (introducir)" ? cuentaOtra.trim().length > 0 : !!cuenta;
    return (
      !!formatoImport &&
      !!formatoExport &&
      !!empresa &&
      !!fechaFactura &&
      !!proyecto &&
      cuentaOk &&
      !!ficheroNombre
    );
  }, [
    formatoImport,
    formatoExport,
    empresa,
    fechaFactura,
    proyecto,
    cuenta,
    cuentaOtra,
    ficheroNombre,
  ]);

  function onExportAsk() {
    if (!exportReady) return;
    setMenu("exportar");
  }

  async function onConfirmExport(confirm: boolean) {
    if (!confirm) {
      setMenu("formatoImport");
      return;
    }
    alert("Exportación iniciada. (Integraremos el backend después)");
    setMenu("formatoImport");
  }

  function logout() {
    try {
      sessionStorage.removeItem("token");
      localStorage.removeItem("token");
      sessionStorage.setItem("reset-dashboard-state", "1");
    } catch {}
    router.replace("/");
  }

  return (
    <main
      className="min-h-screen bg-no-repeat bg-center bg-cover p-4"
      style={{
        backgroundImage: "url(/fondo.png)",
        backgroundSize: "100% 100%",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* ⬇️ Aquí va TODO tu JSX original ⬇️ */}
      {/* Pega aquí el bloque JSX tal como ya lo tenías: sidebar, contenido, secciones, etc. */}
    </main>
  );
}

/* ------------------ Componentes auxiliares ------------------ */

function Item({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-3 py-2 rounded-lg transition
        ${
          active
            ? "bg-white/90 shadow font-semibold text-indigo-700"
            : "hover:bg-indigo-200 hover:text-indigo-800"
        }`}
    >
      {children}
    </button>
  );
}

function OptionGrid<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T | null;
  onChange: (v: T) => void;
}) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {options.map((opt) => {
        const selected = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`px-3 py-2 rounded-lg border transition text-sm
              ${
                selected
                  ? "bg-indigo-600 border-indigo-700 text-white font-semibold ring-2 ring-indigo-300"
                  : "border-indigo-300 text-indigo-800 hover:bg-indigo-100"
              }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/70 border border-indigo-100 px-3 py-2">
      <div className="text-xs text-indigo-700">{label}</div>
      <div className="font-medium text-gray-900 break-words">{value}</div>
    </div>
  );
}

function formatFecha(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}
