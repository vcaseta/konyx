"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Opciones
const FORMATO_IMPORT_OPTS = ["Eholo", "Gestoria"] as const;
const FORMATO_EXPORT_OPTS = ["Holded", "Gestoria"] as const;
const EMPRESA_OPTS = ["Kissoro", "En Plural Psicologia"] as const;
const PROYECTO_OPTS = [
  "Servicios de Psicologia",
  "Formacion",
  "Administracion SL",
] as const;
const CUENTA_OPTS = [
  "70500000 Prestaciones de servicios",
  "70000000 Venta de mercaderías",
  "Otra (introducir)",
] as const;

type MenuKey =
  | "formatoImport"
  | "formatoExport"
  | "empresa"
  | "fechaFactura"
  | "proyecto"
  | "cuenta"
  | "fichero"
  | "configuracion"
  | "exportar";

export default function DashboardPage() {
  const router = useRouter();

  const [menu, setMenu] = useState<MenuKey>("formatoImport");
  const [formatoImport, setFormatoImport] = useState<(typeof FORMATO_IMPORT_OPTS)[number] | null>(null);
  const [formatoExport, setFormatoExport] = useState<(typeof FORMATO_EXPORT_OPTS)[number] | null>(null);
  const [empresa, setEmpresa] = useState<(typeof EMPRESA_OPTS)[number] | null>(null);
  const [fechaFactura, setFechaFactura] = useState<string>("");
  const [proyecto, setProyecto] = useState<(typeof PROYECTO_OPTS)[number] | null>(null);
  const [cuenta, setCuenta] = useState<(typeof CUENTA_OPTS)[number] | null>(null);
  const [fichero, setFichero] = useState<File | null>(null);

  // Configuración
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const [apiPluralActual, setApiPluralActual] = useState("");
  const [apiPluralNuevo, setApiPluralNuevo] = useState("");
  const [apiKissoroActual, setApiKissoroActual] = useState("");
  const [apiKissoroNuevo, setApiKissoroNuevo] = useState("");

  const allComplete =
    formatoImport &&
    formatoExport &&
    empresa &&
    fechaFactura &&
    proyecto &&
    cuenta &&
    fichero;

  const handleExport = () => {
    if (!allComplete) return;
    alert("Exportación iniciada con los datos seleccionados.");
    // TODO: Llamar al backend con todas las variables seleccionadas
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-60 bg-blue-900/80 text-white flex flex-col p-4">
        <div className="flex items-center justify-center mb-8">
          <Image src="/logo.png" alt="Logo" width={192} height={68} />
        </div>
        <nav className="space-y-2 text-sm">
          <Item active={menu === "formatoImport"} onClick={() => setMenu("formatoImport")}>
            Formato Importación
          </Item>
          <Item active={menu === "formatoExport"} onClick={() => setMenu("formatoExport")}>
            Formato Exportación
          </Item>
          <Item active={menu === "empresa"} onClick={() => setMenu("empresa")}>
            Empresa
          </Item>
          <Item active={menu === "fechaFactura"} onClick={() => setMenu("fechaFactura")}>
            Fecha Factura
          </Item>
          <Item active={menu === "proyecto"} onClick={() => setMenu("proyecto")}>
            Proyecto
          </Item>
          <Item active={menu === "cuenta"} onClick={() => setMenu("cuenta")}>
            Cuenta Contable
          </Item>
          <Item active={menu === "fichero"} onClick={() => setMenu("fichero")}>
            Fichero de datos
          </Item>
          <Item active={menu === "configuracion"} onClick={() => setMenu("configuracion")}>
            Configuración
          </Item>
          <Item
            active={menu === "exportar"}
            onClick={() => allComplete && setMenu("exportar")}
            disabled={!allComplete}
          >
            <span className={allComplete ? "font-bold text-indigo-200" : "text-gray-400"}>
              Exportar
            </span>
          </Item>
          <Item onClick={() => router.push("/")}>Cerrar Sesión</Item>
        </nav>
      </aside>

      {/* Contenido */}
      <main className="flex-1 flex flex-col p-6 bg-[url('/fondo.png')] bg-cover bg-center overflow-y-auto">
        <div className="flex-1">
          {menu === "formatoImport" && (
            <Section title="Formato Importación">
              <OptionGrid options={FORMATO_IMPORT_OPTS} value={formatoImport} onChange={setFormatoImport} />
            </Section>
          )}
          {menu === "formatoExport" && (
            <Section title="Formato Exportación">
              <OptionGrid options={FORMATO_EXPORT_OPTS} value={formatoExport} onChange={setFormatoExport} />
            </Section>
          )}
          {menu === "empresa" && (
            <Section title="Empresa">
              <OptionGrid options={EMPRESA_OPTS} value={empresa} onChange={setEmpresa} />
            </Section>
          )}
          {menu === "fechaFactura" && (
            <Section title="Fecha Factura">
              <input
                type="date"
                value={fechaFactura}
                onChange={(e) => setFechaFactura(e.target.value)}
                className="border rounded px-3 py-2"
              />
            </Section>
          )}
          {menu === "proyecto" && (
            <Section title="Proyecto">
              <OptionGrid options={PROYECTO_OPTS} value={proyecto} onChange={setProyecto} />
            </Section>
          )}
          {menu === "cuenta" && (
            <Section title="Cuenta Contable">
              <OptionGrid options={CUENTA_OPTS} value={cuenta} onChange={setCuenta} />
              {cuenta === "Otra (introducir)" && (
                <input
                  type="text"
                  placeholder="Introduce la cuenta"
                  className="border rounded px-3 py-2 mt-3 w-full"
                />
              )}
            </Section>
          )}
          {menu === "fichero" && (
            <Section title="Fichero de datos">
              <input type="file" onChange={(e) => setFichero(e.target.files?.[0] || null)} />
              {fichero && <p className="text-sm mt-2">Archivo seleccionado: {fichero.name}</p>}
            </Section>
          )}
          {menu === "configuracion" && (
            <Section title="Configuración">
              <h3 className="font-semibold mb-2">Cambio de Contraseña</h3>
              <input
                type="password"
                placeholder="Contraseña actual"
                value={oldPass}
                onChange={(e) => setOldPass(e.target.value)}
                className="border rounded px-3 py-2 mb-2 block w-full"
              />
              <input
                type="password"
                placeholder="Nueva contraseña"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                className="border rounded px-3 py-2 mb-2 block w-full"
              />
              <input
                type="password"
                placeholder="Confirmar nueva contraseña"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                className="border rounded px-3 py-2 mb-4 block w-full"
              />

              <h3 className="font-semibold mb-2">API Holded En Plural Psicologia</h3>
              <input
                type="text"
                placeholder="API vigente"
                value={apiPluralActual}
                onChange={(e) => setApiPluralActual(e.target.value)}
                className="border rounded px-3 py-2 mb-2 block w-full"
              />
              <input
                type="text"
                placeholder="Nuevo API"
                value={apiPluralNuevo}
                onChange={(e) => setApiPluralNuevo(e.target.value)}
                className="border rounded px-3 py-2 mb-4 block w-full"
              />

              <h3 className="font-semibold mb-2">API Holded Kissoro</h3>
              <input
                type="text"
                placeholder="API vigente"
                value={apiKissoroActual}
                onChange={(e) => setApiKissoroActual(e.target.value)}
                className="border rounded px-3 py-2 mb-2 block w-full"
              />
              <input
                type="text"
                placeholder="Nuevo API"
                value={apiKissoroNuevo}
                onChange={(e) => setApiKissoroNuevo(e.target.value)}
                className="border rounded px-3 py-2 mb-2 block w-full"
              />
            </Section>
          )}
          {menu === "exportar" && (
            <Section title="Exportar">
              <p className="mb-4">¿Desea exportar los datos seleccionados?</p>
              <button
                onClick={handleExport}
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
              >
                Sí, exportar
              </button>
            </Section>
          )}
        </div>

        {/* Resumen */}
        <div className="bg-indigo-100 p-4 rounded-lg mt-6 text-sm">
          <h3 className="font-semibold mb-2">Datos seleccionados</h3>
          <ul className="list-disc ml-5 space-y-1">
            <li>Formato Importación: {formatoImport || "-"}</li>
            <li>Formato Exportación: {formatoExport || "-"}</li>
            <li>Empresa: {empresa || "-"}</li>
            <li>Fecha Factura: {fechaFactura || "-"}</li>
            <li>Proyecto: {proyecto || "-"}</li>
            <li>Cuenta: {cuenta || "-"}</li>
            <li>Fichero: {fichero ? fichero.name : "-"}</li>
          </ul>
        </div>
      </main>
    </div>
  );
}

/* ---------------------- COMPONENTES AUXILIARES ---------------------- */

function Item({
  active,
  onClick,
  children,
  disabled,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full text-left px-3 py-2 rounded-lg transition
        ${
          active
            ? "bg-white/90 shadow font-semibold text-indigo-700"
            : "hover:bg-indigo-400"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {children}
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/90 backdrop-blur rounded-xl shadow p-6">
      <h2 className="text-lg font-bold mb-4">{title}</h2>
      {children}
    </div>
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
            className={`px-3 py-2 rounded-lg text-sm transition
              ${
                selected
                  ? "bg-indigo-600 text-white font-semibold"
                  : "border border-indigo-300 text-indigo-800 hover:bg-indigo-100"
              }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

