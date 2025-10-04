@@ -1,10 +1,10 @@
// app/dashboard/page.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState, ChangeEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

/* ---------------- Types ---------------- */
/* ------------------ Constantes ------------------ */
type MenuKey =
  | "formatoImport"
  | "formatoExport"
@@ -17,102 +17,112 @@ type MenuKey =
  | "exportar"
  | "cerrar";

type ConfigTab = "password" | "apis";

const FORMATO_IMPORT_OPTS = ["Eholo", "Gestoria"] as const;
const FORMATO_EXPORT_OPTS = ["Holded", "Gestoria"] as const;
const EMPRESAS = ["Kissoro", "En Plural Psicologia"] as const;
const PROYECTOS = ["Servicios de Psicologia", "Formacion", "Administracion SL"] as const;
const CUENTAS = ["70500000 Prestaciones de servicios", "70000000 Venta de mercaderías", "Otra (introducir)"] as const;

/* -------- Persistencia de APIs en localStorage -------- */
const LS_KEYS = {
  kissoro: "api_kissoro_vigente",
  enplural: "api_enplural_vigente",
};

/* ------------- Helpers ------------- */
function formatDateDDMMYYYY(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
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

/* ------------------ Helpers de storage (demo) ------------------ */
const PASS_KEY = "konyx.pass";
const API_KISSORO_KEY = "konyx.api.kissoro";
const API_ENPLURAL_KEY = "konyx.api.enplural";

function getStoredPass(): string {
  if (typeof window === "undefined") return "admin";
  const v = localStorage.getItem(PASS_KEY);
  return v ?? "admin";
}
function setStoredPass(v: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PASS_KEY, v);
}

function getStoredApi(key: string): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(key) ?? "";
}
function setStoredApi(key: string, v: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, v);
}

/* ================== Page ================== */
/* ------------------ Página ------------------ */
export default function DashboardPage() {
  const router = useRouter();

  /* ---- Protección de ruta: requiere login en cada sesión ---- */
  // Requiere login: si no hay token de esta sesión, redirige a /
  useEffect(() => {
    const t = sessionStorage.getItem("token");
    if (!t) router.replace("/");
  }, [router]);

  /* ---- Menú activo ---- */
  // Menú activo
  const [menu, setMenu] = useState<MenuKey>("formatoImport");

  /* ---- Estado de selección ---- */
  // Selecciones
  const [formatoImport, setFormatoImport] =
    useState<(typeof FORMATO_IMPORT_OPTS)[number] | null>(null);
  const [formatoExport, setFormatoExport] =
    useState<(typeof FORMATO_EXPORT_OPTS)[number] | null>(null);

  const [empresa, setEmpresa] =
    useState<(typeof EMPRESAS)[number] | null>(null);

  const [empresa, setEmpresa] = useState<(typeof EMPRESAS)[number] | null>(null);
  const [fechaFactura, setFechaFactura] = useState<string>("");
  const [proyecto, setProyecto] =
    useState<(typeof PROYECTOS)[number] | null>(null);

  const [cuenta, setCuenta] =
    useState<(typeof CUENTAS)[number] | null>(null);
  const [cuenta, setCuenta] = useState<(typeof CUENTAS)[number] | null>(null);
  const [cuentaOtra, setCuentaOtra] = useState<string>("");

  const [ficheroNombre, setFicheroNombre] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  /* ---- Configuración: cambio contraseña ---- */
  const onPickFileClick = () => fileInputRef.current?.click();
  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    setFicheroNombre(f ? f.name : "");
  };

  // Configuración: Contraseña
  const [passActual, setPassActual] = useState("");
  const [passNueva, setPassNueva] = useState("");
  const [passConfirma, setPassConfirma] = useState("");
  const [passMsg, setPassMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  /* ---- Configuración: APIs con persistencia ---- */
  // Configuración: APIs (vigente solo lectura, nuevo editable + “Cambio”)
  const [apiKissoroVigente, setApiKissoroVigente] = useState("");
  const [apiKissoroNuevo, setApiKissoroNuevo] = useState("");
  const [apiKissoroMsg, setApiKissoroMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const [apiEnPluralVigente, setApiEnPluralVigente] = useState("");
  const [apiEnPluralNuevo, setApiEnPluralNuevo] = useState("");
  const [apiEnPluralMsg, setApiEnPluralMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Cargar vigentes desde localStorage
  // Cargar valores vigentes al entrar
  useEffect(() => {
    try {
      const k = localStorage.getItem(LS_KEYS.kissoro) || "";
      const e = localStorage.getItem(LS_KEYS.enplural) || "";
      setApiKissoroVigente(k);
      setApiEnPluralVigente(e);
    } catch {
      /* noop */
    // contraseña (si no existe, se inicializa a "admin")
    if (!localStorage.getItem(PASS_KEY)) {
      setStoredPass("admin");
    }
    // APIs vigentes
    setApiKissoroVigente(getStoredApi(API_KISSORO_KEY));
    setApiEnPluralVigente(getStoredApi(API_ENPLURAL_KEY));
  }, []);

  /* ---- Toast (nuevo) ---- */
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  useEffect(() => {
    if (!toastMsg) return;
    const t = setTimeout(() => setToastMsg(null), 3000);
    return () => clearTimeout(t);
  }, [toastMsg]);

  /* ---- Tabs de configuración ---- */
  const [configTab, setConfigTab] = useState<ConfigTab>("password");

  /* ---- Validación para habilitar “Exportar” ---- */
  // Habilitación de Exportar
  const exportReady = useMemo(() => {
    const cuentaOk = cuenta === "Otra (introducir)" ? cuentaOtra.trim().length > 0 : !!cuenta;
    const cuentaOk =
      cuenta === "Otra (introducir)"
        ? cuentaOtra.trim().length > 0
        : !!cuenta;
    return (
      !!formatoImport &&
      !!formatoExport &&
@@ -122,510 +132,529 @@ export default function DashboardPage() {
      cuentaOk &&
      !!ficheroNombre
    );
  }, [formatoImport, formatoExport, empresa, fechaFactura, proyecto, cuenta, cuentaOtra, ficheroNombre]);

  /* ---- Handlers ---- */
  function onPickFileClick() {
    fileInputRef.current?.click();
  }

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    setFicheroNombre(f ? f.name : "");
  }

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

  // Exportar (solo esqueleto por ahora)
  function onExportAsk() {
    if (!exportReady) return;
    setMenu("exportar");
  }

  async function onConfirmExport(confirm: boolean) {
    if (!confirm) {
  function onConfirmExport(ok: boolean) {
    if (!ok) {
      setMenu("formatoImport");
      return;
    }
    alert("Exportación iniciada. (Conectaremos el backend en el siguiente paso)");
    alert("Exportación iniciada (conectaremos backend después).");
    setMenu("formatoImport");
  }

  function logout() {
    sessionStorage.removeItem("token");
    router.replace("/");
  // Cambio de contraseña (pulsador “Cambio”)
  function onCambioPassword() {
    setPassMsg(null);
    const vigente = getStoredPass();
    if (passActual.trim() !== vigente) {
      setPassMsg({ type: "err", text: "La contraseña actual no coincide." });
      return;
    }
    if (!passNueva.trim() || !passConfirma.trim()) {
      setPassMsg({ type: "err", text: "Rellena nueva contraseña y confirmación." });
      return;
    }
    if (passNueva !== passConfirma) {
      setPassMsg({ type: "err", text: "La nueva contraseña y su confirmación no coinciden." });
      return;
    }
    setStoredPass(passNueva);
    setPassMsg({ type: "ok", text: "Contraseña actualizada correctamente." });
    setPassActual("");
    setPassNueva("");
    setPassConfirma("");
  }

  /* ---- Aplicar cambios de APIs (nuevo: con toast) ---- */
  function aplicarCambioKissoro() {
    const nuevo = apiKissoroNuevo.trim();
    if (!nuevo) return;
    setApiKissoroVigente(nuevo);
    try {
      localStorage.setItem(LS_KEYS.kissoro, nuevo);
    } catch {}
  // Cambio de API Kissoro
  function onCambioApiKissoro() {
    setApiKissoroMsg(null);
    if (!apiKissoroNuevo.trim()) {
      setApiKissoroMsg({ type: "err", text: "Introduce el nuevo API." });
      return;
    }
    setStoredApi(API_KISSORO_KEY, apiKissoroNuevo.trim());
    setApiKissoroVigente(apiKissoroNuevo.trim());
    setApiKissoroNuevo("");
    setToastMsg("API Holded Kissoro actualizada");
    setApiKissoroMsg({ type: "ok", text: "API Kissoro actualizado." });
  }

  function aplicarCambioEnPlural() {
    const nuevo = apiEnPluralNuevo.trim();
    if (!nuevo) return;
    setApiEnPluralVigente(nuevo);
    try {
      localStorage.setItem(LS_KEYS.enplural, nuevo);
    } catch {}
  // Cambio de API En Plural Psicologia
  function onCambioApiEnPlural() {
    setApiEnPluralMsg(null);
    if (!apiEnPluralNuevo.trim()) {
      setApiEnPluralMsg({ type: "err", text: "Introduce el nuevo API." });
      return;
    }
    setStoredApi(API_ENPLURAL_KEY, apiEnPluralNuevo.trim());
    setApiEnPluralVigente(apiEnPluralNuevo.trim());
    setApiEnPluralNuevo("");
    setToastMsg("API Holded En Plural Psicologia actualizada");
  }

  /* ---- UI auxiliares ---- */
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
              ? "bg-indigo-600/90 text-white font-semibold shadow"
              : "hover:bg-indigo-200 hover:text-indigo-800"
          }`}
      >
        {children}
      </button>
    );
    setApiEnPluralMsg({ type: "ok", text: "API En Plural Psicologia actualizado." });
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
  // Cerrar sesión
  function logout() {
    sessionStorage.removeItem("token");
    router.replace("/");
  }

  function SummaryItem({ label, value }: { label: string; value: string }) {
    return (
      <div className="rounded-lg bg-white/70 border border-indigo-100 px-3 py-2">
        <div className="text-xs text-indigo-700">{label}</div>
        <div className="font-medium text-gray-900 break-words">{value}</div>
      </div>
    );
  // Formatea fecha DD-MM-YYYY para resumen
  function fmtFecha(fechaIso: string) {
    if (!fechaIso) return "—";
    const d = new Date(fechaIso);
    if (Number.isNaN(d.getTime())) return "—";
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  }

  /* ================== Render ================== */
  return (
    <main
      className="min-h-screen bg-no-repeat bg-center bg-cover"
      className="min-h-screen bg-no-repeat bg-center bg-cover p-4"
      style={{
        backgroundImage: "url(/fondo.png)",
        backgroundSize: "100% 100%",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="min-h-screen bg-black/30">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6">
            {/* ---------- Sidebar ---------- */}
            <aside className="rounded-2xl bg-slate-500/90 backdrop-blur p-4 md:p-5 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <img src="/logo.png" alt="Konyx" className="h-98 w-auto" />
              </div>

              <nav className="space-y-1 text-white/90">
                <p className="px-2 text-xs uppercase tracking-wide text-white/70">Dashboard</p>

                <Item active={menu === "formatoImport"} onClick={() => setMenu("formatoImport")}>
                  Formato Importación
                </Item>
                <Item active={menu === "formatoExport"} onClick={() => setMenu("formatoExport")}>
                  Formato Exportación
                </Item>
                <Item active={menu === "empresa"} onClick={() => setMenu("empresa")}>
                  Empresa
                </Item>
                <Item active={menu === "fecha"} onClick={() => setMenu("fecha")}>
                  Fecha factura
                </Item>
                <Item active={menu === "proyecto"} onClick={() => setMenu("proyecto")}>
                  Proyecto
                </Item>
                <Item active={menu === "cuenta"} onClick={() => setMenu("cuenta")}>
                  Cuenta contable
      <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
        {/* ------------ Sidebar ------------ */}
        <aside className="md:sticky md:top-6">
          <div className="bg-slate-500/90 backdrop-blur rounded-2xl shadow p-4">
            <div className="flex justify-center mb-4">
              {/* LOGO al doble de tamaño: h-48 */}
              <img src="/logo.png" alt="Konyx" className="h-48 w-auto drop-shadow-md" />
            </div>

            {/* Menú */}
            <nav className="space-y-2">
              <Item active={menu === "formatoImport"} onClick={() => setMenu("formatoImport")}>
                Formato Importación
              </Item>
              <Item active={menu === "formatoExport"} onClick={() => setMenu("formatoExport")}>
                Formato Exportación
              </Item>
              <Item active={menu === "empresa"} onClick={() => setMenu("empresa")}>
                Empresa
              </Item>
              <Item active={menu === "fecha"} onClick={() => setMenu("fecha")}>
                Fecha factura
              </Item>
              <Item active={menu === "proyecto"} onClick={() => setMenu("proyecto")}>
                Proyecto
              </Item>
              <Item active={menu === "cuenta"} onClick={() => setMenu("cuenta")}>
                Cuenta contable
              </Item>
              <Item active={menu === "fichero"} onClick={() => setMenu("fichero")}>
                Fichero de datos
              </Item>
              <Item active={menu === "config"} onClick={() => setMenu("config")}>
                Configuración
              </Item>

              {/* Exportar resaltado cuando está disponible */}
              <button
                type="button"
                onClick={onExportAsk}
                className={`w-full text-left px-3 py-2 rounded-lg transition font-semibold border
                  ${
                    exportReady
                      ? "border-indigo-600 text-indigo-700 bg-white/90 shadow hover:bg-indigo-200 hover:text-indigo-800"
                      : "border-gray-300 text-gray-200 cursor-not-allowed"
                  }`}
                title={exportReady ? "Listo para exportar" : "Completa todos los campos para exportar"}
              >
                Exportar
              </button>

              <div className="pt-2">
                <Item active={menu === "cerrar"} onClick={() => setMenu("cerrar")}>
                  Cerrar Sesión
                </Item>
                <Item active={menu === "fichero"} onClick={() => setMenu("fichero")}>
                  Fichero de datos
                </Item>
                <Item active={menu === "config"} onClick={() => setMenu("config")}>
                  Configuración
                </Item>

                {/* Exportar resaltado cuando está disponible */}
                <button
                  type="button"
                  onClick={onExportAsk}
                  className={`w-full text-left px-3 py-2 rounded-lg transition font-semibold border
                    ${
                      exportReady
                        ? "border-indigo-600 text-indigo-700 bg-white/90 shadow hover:bg-indigo-200 hover:text-indigo-800"
                        : "border-gray-300 text-gray-200 cursor-not-allowed"
                    }`}
                  title={exportReady ? "Listo para exportar" : "Completa todos los campos para exportar"}
                >
                  Exportar
                </button>

                <div className="pt-2">
                  <button
                    onClick={() => setMenu("cerrar")}
                    className={`w-full text-left px-3 py-2 rounded-lg transition ${
                      menu === "cerrar"
                        ? "bg-red-500/20 text-red-100"
                        : "hover:bg-red-500/10 text-red-200"
                    }`}
                  >
                    Cerrar sesión
                  </button>
                </div>
              </nav>
            </aside>

            {/* ---------- Contenido principal ---------- */}
            <section className="space-y-6">
              {/* Panel de selección a la derecha */}
              <div className="bg-white/90 backdrop-blur rounded-2xl shadow p-6">
                {menu === "formatoImport" && (
                  <div>
                    <h2 className="text-lg font-semibold mb-4">Formato Importación</h2>
                    <OptionGrid
                      options={FORMATO_IMPORT_OPTS}
                      value={formatoImport}
                      onChange={(v) => setFormatoImport(v)}
              </div>
            </nav>
          </div>
        </aside>

        {/* ------------ Contenido (derecha) ------------ */}
        <section className="space-y-6">
          {/* Panel de selección (carta blanca) */}
          <div className="bg-white/90 backdrop-blur rounded-2xl shadow p-6">
            {menu === "formatoImport" && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Formato Importación</h2>
                <OptionGrid
                  options={FORMATO_IMPORT_OPTS}
                  value={formatoImport}
                  onChange={(v) => setFormatoImport(v)}
                />
              </div>
            )}

            {menu === "formatoExport" && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Formato Exportación</h2>
                <OptionGrid
                  options={FORMATO_EXPORT_OPTS}
                  value={formatoExport}
                  onChange={(v) => setFormatoExport(v)}
                />
              </div>
            )}

            {menu === "empresa" && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Empresa</h2>
                <OptionGrid
                  options={EMPRESAS}
                  value={empresa}
                  onChange={(v) => setEmpresa(v)}
                />
              </div>
            )}

            {menu === "fecha" && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Fecha factura</h2>
                <input
                  type="date"
                  value={fechaFactura}
                  onChange={(e) => setFechaFactura(e.target.value)}
                  className="rounded-lg border border-indigo-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}

            {menu === "proyecto" && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Proyecto</h2>
                <OptionGrid
                  options={PROYECTOS}
                  value={proyecto}
                  onChange={(v) => setProyecto(v)}
                />
              </div>
            )}

            {menu === "cuenta" && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Cuenta contable</h2>
                <OptionGrid
                  options={CUENTAS}
                  value={cuenta}
                  onChange={(v) => setCuenta(v)}
                />
                {cuenta === "Otra (introducir)" && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-1">Otra cuenta</label>
                    <input
                      type="text"
                      value={cuentaOtra}
                      onChange={(e) => setCuentaOtra(e.target.value)}
                      placeholder="Introduce tu cuenta"
                      className="w-full rounded-lg border border-indigo-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                )}

                {menu === "formatoExport" && (
                  <div>
                    <h2 className="text-lg font-semibold mb-4">Formato Exportación</h2>
                    <OptionGrid
                      options={FORMATO_EXPORT_OPTS}
                      value={formatoExport}
                      onChange={(v) => setFormatoExport(v)}
                    />
                  </div>
              </div>
            )}

            {menu === "fichero" && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Fichero de datos</h2>
                <label className="inline-flex items-center gap-3 px-4 py-2 rounded-lg border border-indigo-300 hover:bg-indigo-50 cursor-pointer">
                  <span className="text-indigo-700 font-medium">Seleccionar Excel</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    className="hidden"
                    onChange={onPickFile}
                  />
                </label>
                {ficheroNombre && (
                  <p className="mt-2 text-sm text-indigo-700 font-semibold">{ficheroNombre}</p>
                )}
              </div>
            )}

                {menu === "empresa" && (
                  <div>
                    <h2 className="text-lg font-semibold mb-4">Empresa</h2>
                    <OptionGrid
                      options={EMPRESAS}
                      value={empresa}
                      onChange={(v) => setEmpresa(v)}
                    />
                  </div>
                )}
            {menu === "config" && (
              <div className="space-y-8">
                <h2 className="text-lg font-semibold">Configuración</h2>

                {menu === "fecha" && (
                  <div>
                    <h2 className="text-lg font-semibold mb-4">Fecha factura</h2>
                {/* Cambio de contraseña */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">Cambio de contraseña</h3>
                  <div className="grid md:grid-cols-[1fr_1fr_1fr_auto] gap-3 items-center">
                    <input
                      type="date"
                      value={fechaFactura}
                      onChange={(e) => setFechaFactura(e.target.value)}
                      type="password"
                      value={passActual}
                      onChange={(e) => setPassActual(e.target.value)}
                      placeholder="Contraseña actual"
                      className="rounded-lg border border-indigo-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                )}

                {menu === "proyecto" && (
                  <div>
                    <h2 className="text-lg font-semibold mb-4">Proyecto</h2>
                    <OptionGrid
                      options={PROYECTOS}
                      value={proyecto}
                      onChange={(v) => setProyecto(v)}
                    <input
                      type="password"
                      value={passNueva}
                      onChange={(e) => setPassNueva(e.target.value)}
                      placeholder="Nueva contraseña"
                      className="rounded-lg border border-indigo-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                )}

                {menu === "cuenta" && (
                  <div>
                    <h2 className="text-lg font-semibold mb-4">Cuenta contable</h2>
                    <OptionGrid
                      options={CUENTAS}
                      value={cuenta}
                      onChange={(v) => setCuenta(v)}
                    <input
                      type="password"
                      value={passConfirma}
                      onChange={(e) => setPassConfirma(e.target.value)}
                      placeholder="Confirmar nueva contraseña"
                      className="rounded-lg border border-indigo-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {cuenta === "Otra (introducir)" && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium mb-1">Otra cuenta</label>
                        <input
                          type="text"
                          value={cuentaOtra}
                          onChange={(e) => setCuentaOtra(e.target.value)}
                          placeholder="Introduce tu cuenta"
                          className="w-full rounded-lg border border-indigo-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    )}
                  </div>
                )}

                {menu === "fichero" && (
                  <div>
                    <h2 className="text-lg font-semibold mb-4">Fichero de datos</h2>
                    <label className="inline-flex items-center gap-3 px-4 py-2 rounded-lg border border-indigo-300 hover:bg-indigo-50 cursor-pointer">
                      <span className="text-indigo-700 font-medium">Seleccionar Excel</span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls"
                        className="hidden"
                        onChange={onFileChange}
                        onClick={(e) => ((e.target as HTMLInputElement).value = "")}
                      />
                    </label>
                    {ficheroNombre && (
                      <p className="mt-2 text-sm text-indigo-700 font-semibold">{ficheroNombre}</p>
                    )}
                    <button
                      type="button"
                      onClick={onCambioPassword}
                      className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
                    >
                      Cambio
                    </button>
                  </div>
                )}
                  {passMsg && (
                    <p
                      className={`text-sm ${
                        passMsg.type === "ok" ? "text-green-700" : "text-red-700"
                      }`}
                    >
                      {passMsg.text}
                    </p>
                  )}
                </div>

                {menu === "config" && (
                  <div className="space-y-8">
                    <h2 className="text-lg font-semibold">Configuración</h2>

                    {/* Tabs */}
                    <div className="flex gap-2">
                      {(["password", "apis"] as const).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setConfigTab(tab)}
                          className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                            configTab === tab
                              ? "bg-white/20 text-gray-900"
                              : "bg-white/10 text-gray-700 hover:bg-white/15"
                          }`}
                        >
                          {tab === "password" ? "Cambio de contraseña" : "APIs"}
                        </button>
                      ))}
                    </div>

                    {/* Password */}
                    {configTab === "password" && (
                      <div className="bg-white/90 backdrop-blur rounded-xl p-4 space-y-4">
                        <div className="grid md:grid-cols-3 gap-3">
                          <input
                            type="password"
                            value={passActual}
                            onChange={(e) => setPassActual(e.target.value)}
                            placeholder="Contraseña actual"
                            className="rounded-lg border border-indigo-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                          <input
                            type="password"
                            value={passNueva}
                            onChange={(e) => setPassNueva(e.target.value)}
                            placeholder="Nueva contraseña"
                            className="rounded-lg border border-indigo-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                          <input
                            type="password"
                            value={passConfirma}
                            onChange={(e) => setPassConfirma(e.target.value)}
                            placeholder="Confirmar nueva contraseña"
                            className="rounded-lg border border-indigo-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <p className="text-xs text-gray-500">
                          (Acción del cambio se integrará con backend más adelante)
                        </p>
                      </div>
                    )}

                    {/* APIs (con “Cambio” y toast) */}
                    {configTab === "apis" && (
                      <div className="bg-white/90 backdrop-blur rounded-xl p-4 space-y-6">
                        {/* Kissoro */}
                        <div>
                          <h3 className="text-sm font-semibold mb-2">API Holded Kissoro</h3>
                          <div className="grid md:grid-cols-[1fr_auto] gap-3 items-center">
                            <div className="grid md:grid-cols-2 gap-3">
                              <input
                                type="text"
                                value={apiKissoroVigente}
                                readOnly
                                placeholder="API vigente"
                                className="rounded-lg border border-indigo-200 bg-gray-100 text-gray-600 px-3 py-2 cursor-not-allowed"
                              />
                              <input
                                type="text"
                                value={apiKissoroNuevo}
                                onChange={(e) => setApiKissoroNuevo(e.target.value)}
                                placeholder="Nuevo API"
                                className="rounded-lg border border-indigo-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={aplicarCambioKissoro}
                              disabled={!apiKissoroNuevo.trim()}
                              className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50"
                              title="Aplicar nuevo API"
                            >
                              Cambio
                            </button>
                          </div>
                        </div>

                        {/* En Plural Psicologia */}
                        <div>
                          <h3 className="text-sm font-semibold mb-2">API Holded En Plural Psicologia</h3>
                          <div className="grid md:grid-cols-[1fr_auto] gap-3 items-center">
                            <div className="grid md:grid-cols-2 gap-3">
                              <input
                                type="text"
                                value={apiEnPluralVigente}
                                readOnly
                                placeholder="API vigente"
                                className="rounded-lg border border-indigo-200 bg-gray-100 text-gray-600 px-3 py-2 cursor-not-allowed"
                              />
                              <input
                                type="text"
                                value={apiEnPluralNuevo}
                                onChange={(e) => setApiEnPluralNuevo(e.target.value)}
                                placeholder="Nuevo API"
                                className="rounded-lg border border-indigo-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={aplicarCambioEnPlural}
                              disabled={!apiEnPluralNuevo.trim()}
                              className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50"
                              title="Aplicar nuevo API"
                            >
                              Cambio
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                {/* API Holded Kissoro */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">API Holded Kissoro</h3>
                  <div className="grid md:grid-cols-[1fr_1fr_auto] gap-3 items-center">
                    <input
                      type="text"
                      value={apiKissoroVigente}
                      readOnly
                      placeholder="API vigente"
                      className="rounded-lg border border-indigo-300 px-3 py-2 bg-gray-100 text-gray-600"
                    />
                    <input
                      type="text"
                      value={apiKissoroNuevo}
                      onChange={(e) => setApiKissoroNuevo(e.target.value)}
                      placeholder="Nuevo API"
                      className="rounded-lg border border-indigo-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={onCambioApiKissoro}
                      className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
                    >
                      Cambio
                    </button>
                  </div>
                )}

                {menu === "exportar" && (
                  <div>
                    <h2 className="text-lg font-semibold mb-4">Exportar</h2>
                    <p className="text-sm text-gray-700 mb-4">
                      ¿Deseas exportar los datos con la configuración seleccionada?
                  {apiKissoroMsg && (
                    <p
                      className={`text-sm ${
                        apiKissoroMsg.type === "ok" ? "text-green-700" : "text-red-700"
                      }`}
                    >
                      {apiKissoroMsg.text}
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => onConfirmExport(true)}
                        className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                      >
                        Sí, exportar
                      </button>
                      <button
                        onClick={() => onConfirmExport(false)}
                        className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                      >
                        No, cancelar
                      </button>
                    </div>
                  </div>
                )}
                  )}
                </div>

                {menu === "cerrar" && (
                  <div>
                    <h2 className="text-lg font-semibold mb-4">Cerrar Sesión</h2>
                    <p className="text-sm text-gray-700 mb-4">
                      ¿Seguro que quieres cerrar sesión?
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={logout}
                        className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                      >
                        Sí
                      </button>
                      <button
                        onClick={() => setMenu("formatoImport")}
                        className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                      >
                        No
                      </button>
                    </div>
                {/* API Holded En Plural Psicologia */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">API Holded En Plural Psicologia</h3>
                  <div className="grid md:grid-cols-[1fr_1fr_auto] gap-3 items-center">
                    <input
                      type="text"
                      value={apiEnPluralVigente}
                      readOnly
                      placeholder="API vigente"
                      className="rounded-lg border border-indigo-300 px-3 py-2 bg-gray-100 text-gray-600"
                    />
                    <input
                      type="text"
                      value={apiEnPluralNuevo}
                      onChange={(e) => setApiEnPluralNuevo(e.target.value)}
                      placeholder="Nuevo API"
                      className="rounded-lg border border-indigo-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={onCambioApiEnPlural}
                      className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
                    >
                      Cambio
                    </button>
                  </div>
                )}
                  {apiEnPluralMsg && (
                    <p
                      className={`text-sm ${
                        apiEnPluralMsg.type === "ok" ? "text-green-700" : "text-red-700"
                      }`}
                    >
                      {apiEnPluralMsg.text}
                    </p>
                  )}
                </div>
              </div>

              {/* Resumen inferior (azulado más oscuro, separado) */}
              <div className="bg-indigo-100/90 rounded-2xl shadow p-6 border border-indigo-200 mt-6">
                <h3 className="text-base font-semibold text-indigo-800 mb-3">
                  Resumen de selección
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                  <SummaryItem label="Formato Importación" value={formatoImport ?? "—"} />
                  <SummaryItem label="Formato Exportación" value={formatoExport ?? "—"} />
                  <SummaryItem label="Empresa" value={empresa ?? "—"} />
                  <SummaryItem label="Fecha factura" value={formatDateDDMMYYYY(fechaFactura)} />
                  <SummaryItem label="Proyecto" value={proyecto ?? "—"} />
                  <SummaryItem
                    label="Cuenta contable"
                    value={cuenta === "Otra (introducir)" ? (cuentaOtra || "—") : (cuenta ?? "—")}
                  />
                  <SummaryItem label="Fichero" value={ficheroNombre || "—"} />
            )}

            {menu === "exportar" && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Exportar</h2>
                <p className="text-sm text-gray-700 mb-4">
                  ¿Deseas exportar los datos con la configuración seleccionada?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => onConfirmExport(true)}
                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    Sí, exportar
                  </button>
                  <button
                    onClick={() => onConfirmExport(false)}
                    className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                  >
                    No, cancelar
                  </button>
                </div>
              </div>
            )}

            {menu === "cerrar" && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Cerrar Sesión</h2>
                <p className="text-sm text-gray-700 mb-4">
                  ¿Seguro que quieres cerrar sesión?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={logout}
                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    Sí
                  </button>
                  <button
                    onClick={() => setMenu("formatoImport")}
                    className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                  >
                    No
                  </button>
                </div>
              </div>
            </section>
            )}
          </div>
        </div>
      </div>

      {/* ---- Toast simple (abajo-derecha) ---- */}
      {toastMsg && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="rounded-lg bg-indigo-600 text-white shadow-lg px-4 py-3">
            {toastMsg}
          {/* Resumen inferior (azulado algo más oscuro) */}
          <div className="bg-indigo-100/90 rounded-2xl shadow p-6 border border-indigo-200 mt-8">
            <h3 className="text-base font-semibold text-indigo-800 mb-3">
              Resumen de selección
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
              <SummaryItem label="Formato Importación" value={formatoImport ?? "—"} />
              <SummaryItem label="Formato Exportación" value={formatoExport ?? "—"} />
              <SummaryItem label="Empresa" value={empresa ?? "—"} />
              <SummaryItem label="Fecha factura" value={fmtFecha(fechaFactura)} />
              <SummaryItem label="Proyecto" value={proyecto ?? "—"} />
              <SummaryItem
                label="Cuenta contable"
                value={cuenta === "Otra (introducir)" ? (cuentaOtra || "—") : (cuenta ?? "—")}
              />
              <SummaryItem label="Fichero" value={ficheroNombre || "—"} />
            </div>
          </div>
        </div>
      )}
        </section>
      </div>
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
  // Activo en lila; hover en lila claro — tal como acordamos
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-3 py-2 rounded-lg transition
        ${
          active
            ? "bg-indigo-600 text-white font-semibold shadow"
            : "hover:bg-indigo-200 hover:text-indigo-800 text-white"
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
