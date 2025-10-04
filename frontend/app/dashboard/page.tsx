// app/dashboard/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

/* ------------------ Constantes ------------------ */
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
const PROYECTOS = [
  "Servicios de Psicologia",
  "Formacion",
  "Administracion SL",
] as const;
const CUENTAS = [
  "70500000 Prestaciones de servicios",
  "70000000 Venta de mercaderías",
  "Otra (introducir)",
] as const;

/* ------------------ Dashboard ------------------ */
export default function DashboardPage() {
  const router = useRouter();

  // Bloqueo render hasta validar sesión
  const [authChecked, setAuthChecked] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const t = sessionStorage.getItem("konyx_session");
    if (!t) {
      router.replace("/"); // sin sesión, redirige a login
    } else {
      setToken(t);
      setAuthChecked(true);
    }
  }, [router]);

  if (!authChecked) return null;

  // Menú activo
  const [menu, setMenu] = useState<MenuKey>("formatoImport");

  // Selecciones
  const [formatoImport, setFormatoImport] = useState<(typeof FORMATO_IMPORT_OPTS)[number] | null>(null);
  const [formatoExport, setFormatoExport] = useState<(typeof FORMATO_EXPORT_OPTS)[number] | null>(null);
  const [empresa, setEmpresa] = useState<(typeof EMPRESAS)[number] | null>(null);
  const [fechaFactura, setFechaFactura] = useState<string>("");
  const [proyecto, setProyecto] = useState<(typeof PROYECTOS)[number] | null>(null);
  const [cuenta, setCuenta] = useState<(typeof CUENTAS)[number] | null>(null);
  const [cuentaOtra, setCuentaOtra] = useState<string>("");
  const [ficheroNombre, setFicheroNombre] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const onPickFileClick = () => fileInputRef.current?.click();
  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    setFicheroNombre(f ? f.name : "");
  };

  // Configuración: contraseña
  const [passActual, setPassActual] = useState("");
  const [passNueva, setPassNueva] = useState("");
  const [passConfirma, setPassConfirma] = useState("");
  const [passMsg, setPassMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Configuración: APIs
  const [apiKissoroVigente, setApiKissoroVigente] = useState("");
  const [apiKissoroNuevo, setApiKissoroNuevo] = useState("");
  const [apiKissoroMsg, setApiKissoroMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const [apiEnPluralVigente, setApiEnPluralVigente] = useState("");
  const [apiEnPluralNuevo, setApiEnPluralNuevo] = useState("");
  const [apiEnPluralMsg, setApiEnPluralMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Cargar APIs
  useEffect(() => {
    if (!token) return;
    async function fetchApis() {
      try {
        const res = await fetch("/auth/apis", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Error al cargar APIs");
        const data = await res.json();
        setApiKissoroVigente(data?.kissoro ?? "");
        setApiEnPluralVigente(data?.enplural ?? "");
      } catch (error) {
        console.error(error);
      }
    }
    fetchApis();
  }, [token]);

  // Habilitación de Exportar
  const exportReady = useMemo(() => {
    const cuentaOk = cuenta === "Otra (introducir)" ? cuentaOtra.trim().length > 0 : !!cuenta;
    return !!formatoImport && !!formatoExport && !!empresa && !!fechaFactura && !!proyecto && cuentaOk && !!ficheroNombre;
  }, [formatoImport, formatoExport, empresa, fechaFactura, proyecto, cuenta, cuentaOtra, ficheroNombre]);

  function onExportAsk() {
    if (!exportReady) return;
    setMenu("exportar");
  }

  function onConfirmExport(ok: boolean) {
    if (!ok) {
      setMenu("formatoImport");
      return;
    }
    alert("Exportación iniciada (conectaremos backend después).");
    setMenu("formatoImport");
  }

  async function onCambioApis() {
    setApiKissoroMsg(null);
    setApiEnPluralMsg(null);
    if (!token) return;

    try {
      const res = await fetch("/auth/apis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          kissoro: apiKissoroNuevo || apiKissoroVigente,
          enplural: apiEnPluralNuevo || apiEnPluralVigente,
        }),
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
  }

  async function onCambioPassword() {
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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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
  }

  function logout() {
    sessionStorage.removeItem("konyx_session");
    router.replace("/");
  }

  function fmtFecha(fechaIso: string) {
    if (!fechaIso) return "—";
    const d = new Date(fechaIso + "T00:00");
    if (Number.isNaN(d.getTime())) return "—";
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  }

  /* ------------------ JSX principal ------------------ */
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
              <button type="button" onClick={onExportAsk} className={`w-full text-left px-3 py-2 rounded-lg transition font-semibold border ${exportReady ? "border-indigo-600 text-indigo-700 bg-white/90 shadow hover:bg-indigo-200 hover:text-indigo-800" : "border-gray-300 text-gray-200 cursor-not-allowed"}`} title={exportReady ? "Listo para exportar" : "Completa todos los campos para exportar"}>Exportar</button>
              <div className="pt-2">
                <Item active={menu === "cerrar"} onClick={() => setMenu("cerrar")}>Cerrar Sesión</Item>
              </div>
            </nav>
          </div>
        </aside>

        {/* Contenido principal */}
        <section className="space-y-6">
          {/* Paneles condicionales */}
          {menu === "formatoImport" && (
            <div className="bg-white/90 backdrop-blur rounded-2xl shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Formato Importación</h2>
              <OptionGrid options={FORMATO_IMPORT_OPTS} value={formatoImport} onChange={setFormatoImport} />
            </div>
          )}

          {menu === "formatoExport" && (
            <div className="bg-white/90 backdrop-blur rounded-2xl shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Formato Exportación</h2>
              <OptionGrid options={FORMATO_EXPORT_OPTS} value={formatoExport} onChange={setFormatoExport} />
            </div>
          )}

          {menu === "empresa" && (
            <div className="bg-white/90 backdrop-blur rounded-2xl shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Empresa</h2>
              <OptionGrid options={EMPRESAS} value={empresa} onChange={setEmpresa} />
            </div>
          )}

          {menu === "fecha" && (
            <div className="bg-white/90 backdrop-blur rounded-2xl shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Fecha factura</h2>
              <input type="date" value={fechaFactura} onChange={(e) => setFechaFactura(e.target.value)} className="rounded-lg border border-indigo-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          )}

          {menu === "proyecto" && (
            <div className="bg-white/90 backdrop-blur rounded-2xl shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Proyecto</h2>
              <OptionGrid options={PROYECTOS} value={proyecto} onChange={setProyecto} />
            </div>
          )}

          {menu === "cuenta" && (
            <div className="bg-white/90 backdrop-blur rounded-2xl shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Cuenta contable</h2>
              <OptionGrid options={CUENTAS} value={cuenta} onChange={setCuenta} />
              {cuenta === "Otra (introducir)" && (
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-1">Otra cuenta</label>
                  <input type="text" value={cuentaOtra} onChange={(e) => setCuentaOtra(e.target.value)} placeholder="Introduce tu cuenta" className="w-full rounded-lg border border-indigo-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              )}
            </div>
          )}

          {menu === "fichero" && (
            <div className="bg-white/90 backdrop-blur rounded-2xl shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Fichero de datos</h2>
              <label className="inline-flex items-center gap-3 px-4 py-2 rounded-lg border border-indigo-300 hover:bg-indigo-50 cursor-pointer">
                <span className="text-indigo-700 font-medium">Seleccionar Excel</span>
                <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={onPickFile} />
              </label>
              {ficheroNombre && <p className="mt-2 text-sm text-indigo-700 font-semibold">{ficheroNombre}</p>}
            </div>
          )}

          {menu === "config" && (
            <div className="bg-white/90 backdrop-blur rounded-2xl shadow p-6 space-y-6">
              <h2 className="text-lg font-semibold">Configuración</h2>
              {/* Cambio contraseña */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Cambio de contraseña</h3>
                <div className="grid md:grid-cols-[1fr_1fr_1fr_auto] gap-3 items-center">
                  <input type="password" value={passActual} onChange={(e) => setPassActual(e.target.value)} placeholder="Contraseña actual" className="rounded-lg border border-indigo-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  <input type="password" value={passNueva} onChange={(e) => setPassNueva(e.target.value)} placeholder="Nueva contraseña" className="rounded-lg border border-indigo-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  <input type="password" value={passConfirma} onChange={(e) => setPassConfirma(e.target.value)} placeholder="Confirmar nueva contraseña" className="rounded-lg border border-indigo-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  <button type="button" onClick={onCambioPassword} className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700">Cambio</button>
                </div>
                {passMsg && <p className={`text-sm ${passMsg.type === "ok" ? "text-green-700" : "text-red-700"}`}>{passMsg.text}</p>}
              </div>
              {/* APIs */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">API Holded Kissoro</h3>
                <div className="grid md:grid-cols-[1fr_1fr_auto] gap-3 items-center">
                  <input type="text" value={apiKissoroVigente} readOnly className="rounded-lg border border-indigo-300 px-3 py-2 bg-gray-100 text-gray-600" />
                  <input type="text" value={apiKissoroNuevo} onChange={(e) => setApiKissoroNuevo(e.target.value)} placeholder="Nuevo API" className="rounded-lg border border-indigo-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  <button type="button" onClick={onCambioApis} className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700">Cambio</button>
                </div>
                {apiKissoroMsg && <p className={`text-sm ${apiKissoroMsg.type === "ok" ? "text-green-700" : "text-red-700"}`}>{apiKissoroMsg.text}</p>}
              </div>
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">API Holded En Plural Psicologia</h3>
                <div className="grid md:grid-cols-[1fr_1fr_auto] gap-3 items-center">
                  <input type="text" value={apiEnPluralVigente} readOnly className="rounded-lg border border-indigo-300 px-3 py-2 bg-gray-100 text-gray-600" />
                  <input type="text" value={apiEnPluralNuevo} onChange={(e) => setApiEnPluralNuevo(e.target.value)} placeholder="Nuevo API" className="rounded-lg border border-indigo-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  <button type="button" onClick={onCambioApis} className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700">Cambio</button>
                </div>
                {apiEnPluralMsg && <p className={`text-sm ${apiEnPluralMsg.type === "ok" ? "text-green-700" : "text-red-700"}`}>{apiEnPluralMsg.text}</p>}
              </div>
            </div>
          )}

          {menu === "exportar" && (
            <div className="bg-white/90 backdrop-blur rounded-2xl shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Exportar</h2>
              <p className="text-sm text-gray-700 mb-4">¿Deseas exportar los datos con la configuración seleccionada?</p>
              <div className="flex gap-3">
                <button onClick={() => onConfirmExport(true)} className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Sí, exportar</button>
                <button onClick={() => onConfirmExport(false)} className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50">No, cancelar</button>
              </div>
            </div>
          )}

          {menu === "cerrar" && (
            <div className="bg-white/90 backdrop-blur rounded-2xl shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Cerrar Sesión</h2>
              <p className="text-sm text-gray-700 mb-4">¿Seguro que quieres cerrar sesión?</p>
              <div className="flex gap-3">
                <button onClick={logout} className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Sí</button>
                <button onClick={() => setMenu("formatoImport")} className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50">No</button>
              </div>
            </div>
          )}

          {/* Resumen inferior */}
          <div className="bg-indigo-100/90 rounded-2xl shadow p-6 border border-indigo-200 mt-8">
            <h3 className="text-base font-semibold text-indigo-800 mb-3">Resumen de selección</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
              <SummaryItem label="Formato Importación" value={formatoImport ?? "—"} />
              <SummaryItem label="Formato Exportación" value={formatoExport ?? "—"} />
              <SummaryItem label="Empresa" value={empresa ?? "—"} />
              <SummaryItem label="Fecha factura" value={fmtFecha(fechaFactura)} />
              <SummaryItem label="Proyecto" value={proyecto ?? "—"} />
              <SummaryItem label="Cuenta contable" value={cuenta === "Otra (introducir)" ? (cuentaOtra || "—") : (cuenta ?? "—")} />
              <SummaryItem label="Fichero" value={ficheroNombre || "—"} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

/* ------------------ Componentes auxiliares ------------------ */
function Item({ active, onClick, children }: { active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" onClick={onClick} className={`w-full text-left px-3 py-2 rounded-lg transition ${active ? "bg-indigo-600 text-white font-semibold shadow" : "hover:bg-indigo-200 hover:text-indigo-800 text-white"}`}>{children}</button>;
}

function OptionGrid<T extends string>({ options, value, onChange }: { options: readonly T[]; value: T | null; onChange: (v: T) => void }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {options.map((opt) => (
        <button key={opt} type="button" onClick={() => onChange(opt)} className={`px-3 py-2 rounded-lg border transition text-sm ${value === opt ? "bg-indigo-600 border-indigo-700 text-white font-semibold ring-2 ring-indigo-300" : "border-indigo-300 text-indigo-800 hover:bg-indigo-100"}`}>{opt}</button>
      ))}
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
