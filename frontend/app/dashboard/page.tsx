"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie"; // Import moved here

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

  // --- Protección de ruta (JWT validación)
  useEffect(() => {
    const token = Cookies.get("konyx_token");
    if (!token) {
      router.replace("/");
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/me`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      cache: "no-store"
    })
      .then(async res => {
        if (!res.ok) throw new Error("Token inválido");
        return res.json();
      })
      .then(data => {
        console.log("Usuario autenticado:", data.user);
      })
      .catch(() => {
        Cookies.remove("konyx_token");
        router.replace("/");
      });
  }, [router]);

  // Menú activo
  const [menu, setMenu] = useState<MenuKey>("formatoImport");

  // Estado variable
  const [formatoImport, setFormatoImport] =
    useState<(typeof FORMATO_IMPORT_OPTS)[number] | null>(null);
  const [formatoExport, setFormatoExport] =
    useState<(typeof FORMATO_EXPORT_OPTS)[number] | null>(null);
  const [empresa, setEmpresa] = useState<(typeof EMPRESAS)[number] | null>(null);
  const [fechaFactura, setFechaFactura] = useState<string>("");
  const [proyecto, setProyecto] = useState<(typeof PROYECTOS)[number] | null>(null);
  const [cuenta, setCuenta] = useState<(typeof CUENTAS)[number] | null>(null);
  const [cuentaOtra, setCuentaOtra] = useState<string>("");
  const [ficheroNombre, setFicheroNombre] = useState<string>("");

  // Configuración persistente
  const [passActual, setPassActual] = useState("");
  const [passNueva, setPassNueva] = useState("");
  const [passConfirma, setPassConfirma] = useState("");
  const [apiKissoroVigente, setApiKissoroVigente] = useState("");
  const [apiKissoroNuevo, setApiKissoroNuevo] = useState("");
  const [apiEnPluralVigente, setApiEnPluralVigente] = useState("");
  const [apiEnPluralNuevo, setApiEnPluralNuevo] = useState("");

  // --- Cargar valores de API vigente (simulado)
  useEffect(() => {
    setApiKissoroVigente("sk_test_kissoro123");
    setApiEnPluralVigente("sk_test_enplural456");
  }, []);

  // --- Reset de estado variable tras login ---
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

  // Fichero
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const onPickFile = () => fileInputRef.current?.click();
  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) setFicheroNombre(f.name);
  }

  // Validación para exportar
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

  // --- Logout ---
  function logout() {
    try {
      sessionStorage.removeItem("token");
      localStorage.removeItem("token");
      Cookies.remove("konyx_token");
      sessionStorage.setItem("reset-dashboard-state", "1");
    } catch {}
    router.replace("/");
  }

  // ------------------ JSX (sin cambios) ------------------
  return (
    <main
      className="min-h-screen bg-no-repeat bg-center bg-cover p-4"
      style={{
        backgroundImage: "url(/fondo.png)",
        backgroundSize: "100% 100%",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* ...el resto de tu JSX sigue exactamente igual */}
    </main>
  );
}

// ------------------ Componentes auxiliares ------------------
// Item, OptionGrid, SummaryItem, formatFecha
// Se mantienen exactamente como los tenías antes
