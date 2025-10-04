"use client";
import React from "react";

/* ------------------ Componentes auxiliares ------------------ */

export function Item({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-3 py-2 rounded-lg transition ${active ? "bg-indigo-600 text-white font-semibold shadow" : "hover:bg-indigo-200 hover:text-indigo-800 text-white"}`}
    >
      {children}
    </button>
  );
}

export function OptionGrid<T extends string>({ options, value, onChange }: { options: readonly T[]; value: T | null; onChange: (v: T) => void }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {options.map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`px-3 py-2 rounded-lg border transition text-sm ${
            value === opt ? "bg-indigo-600 border-indigo-700 text-white font-semibold ring-2 ring-indigo-300" : "border-indigo-300 text-indigo-800 hover:bg-indigo-100"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export function PanelOption<T extends string>({
  title,
  options,
  value,
  onChange,
  children,
}: {
  title: string;
  options: readonly T[];
  value: T | null;
  onChange: (v: T) => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="bg-white/90 backdrop-blur rounded-2xl shadow p-6">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <OptionGrid options={options} value={value} onChange={onChange} />
      {children}
    </div>
  );
}

export function PanelDate({ title, value, onChange }: { title: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="bg-white/90 backdrop-blur rounded-2xl shadow p-6">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <input
        type="date"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="rounded-lg border border-indigo-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  );
}

export function PanelFile({
  value,
  onPickFile,
  onPickFileClick,
  fileInputRef,
}: {
  value: string;
  onPickFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPickFileClick: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}) {
  return (
    <div className="bg-white/90 backdrop-blur rounded-2xl shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Fichero de datos</h2>
      <label
        className="inline-flex items-center gap-3 px-4 py-2 rounded-lg border border-indigo-300 hover:bg-indigo-50 cursor-pointer"
        onClick={onPickFileClick}
      >
        <span className="text-indigo-700 font-medium">Seleccionar Excel</span>
        <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={onPickFile} />
      </label>
      {value && <p className="mt-2 text-sm text-indigo-700 font-semibold">{value}</p>}
    </div>
  );
}

export function PanelConfig({
  passActual,
  passNueva,
  passConfirma,
  setPassActual,
  setPassNueva,
  setPassConfirma,
  passMsg,
  onCambioPassword,
  apiKissoroVigente,
  apiKissoroNuevo,
  setApiKissoroNuevo,
  apiKissoroMsg,
  apiEnPluralVigente,
  apiEnPluralNuevo,
  setApiEnPluralNuevo,
  apiEnPluralMsg,
  onCambioApis,
}: {
  passActual: string;
  passNueva: string;
  passConfirma: string;
  setPassActual: (v: string) => void;
  setPassNueva: (v: string) => void;
  setPassConfirma: (v: string) => void;
  passMsg: { type: "ok" | "err"; text: string } | null;
  onCambioPassword: () => void;

  apiKissoroVigente: string;
  apiKissoroNuevo: string;
  setApiKissoroNuevo: (v: string) => void;
  apiKissoroMsg: { type: "ok" | "err"; text: string } | null;

  apiEnPluralVigente: string;
  apiEnPluralNuevo: string;
  setApiEnPluralNuevo: (v: string) => void;
  apiEnPluralMsg: { type: "ok" | "err"; text: string } | null;

  onCambioApis: () => void;
}) {
  return (
    <div className="bg-white/90 backdrop-blur rounded-2xl shadow p-6 space-y-8">
      <h2 className="text-lg font-semibold">Configuración</h2>

      {/* Cambio de contraseña */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Cambio de contraseña</h3>
        <div className="grid md:grid-cols-[1fr_1fr_1fr_auto] gap-3 items-center">
          <input type="password" value={passActual} onChange={e => setPassActual(e.target.value)} placeholder="Contraseña actual" className="rounded-lg border border-indigo-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <input type="password" value={passNueva} onChange={e => setPassNueva(e.target.value)} placeholder="Nueva contraseña" className="rounded-lg border border-indigo-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <input type="password" value={passConfirma} onChange={e => setPassConfirma(e.target.value)} placeholder="Confirmar nueva contraseña" className="rounded-lg border border-indigo-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <button type="button" onClick={onCambioPassword} className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700">Cambio</button>
        </div>
        {passMsg && <p className={`text-sm ${passMsg.type === "ok" ? "text-green-700" : "text-red-700"}`}>{passMsg.text}</p>}
      </div>

      {/* APIs */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold">API Holded Kissoro</h3>
        <div className="grid md:grid-cols-[1fr_1fr_auto] gap-3 items-center">
          <input type="text" value={apiKissoroVigente} readOnly className="rounded-lg border border-indigo-300 px-3 py-2 bg-gray-100 text-gray-600" />
          <input type="text" value={apiKissoroNuevo} onChange={e => setApiKissoroNuevo(e.target.value)} placeholder="Nuevo API" className="rounded-lg border border-indigo-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <button type="button" onClick={onCambioApis} className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700">Cambio</button>
        </div>
        {apiKissoroMsg && <p className={`text-sm ${apiKissoroMsg.type === "ok" ? "text-green-700" : "text-red-700"}`}>{apiKissoroMsg.text}</p>}
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold">API Holded En Plural Psicologia</h3>
        <div className="grid md:grid-cols-[1fr_1fr_auto] gap-3 items-center">
          <input type="text" value={apiEnPluralVigente} readOnly className="rounded-lg border border-indigo-300 px-3 py-2 bg-gray-100 text-gray-600" />
          <input type="text" value={apiEnPluralNuevo} onChange={e => setApiEnPluralNuevo(e.target.value)} placeholder="Nuevo API" className="rounded-lg border border-indigo-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <button type="button" onClick={onCambioApis} className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700">Cambio</button>
        </div>
        {apiEnPluralMsg && <p className={`text-sm ${apiEnPluralMsg.type === "ok" ? "text-green-700" : "text-red-700"}`}>{apiEnPluralMsg.text}</p>}
      </div>
    </div>
  );
}

export function PanelExport({ onConfirm }: { onConfirm: (ok: boolean) => void }) {
  return (
    <div className="bg-white/90 backdrop-blur rounded-2xl shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Exportar</h2>
      <p className="text-sm text-gray-700 mb-4">¿Deseas exportar los datos con la configuración seleccionada?</p>
      <div className="flex gap-3">
        <button onClick={() => onConfirm(true)} className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Sí, exportar</button>
        <button onClick={() => onConfirm(false)} className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50">No, cancelar</button>
      </div>
    </div>
  );
}

export function PanelCerrar({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="bg-white/90 backdrop-blur rounded-2xl shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Cerrar Sesión</h2>
      <p className="text-sm text-gray-700 mb-4">¿Seguro que quieres cerrar sesión?</p>
      <div className="flex gap-3">
        <button onClick={onConfirm} className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Sí</button>
        <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50">No</button>
      </div>
    </div>
  );
}

export function ResumenInferior() {
  return (
    <div className="bg-indigo-100/90 rounded-2xl shadow p-6 border border-indigo-200 mt-8">
      <h3 className="text-base font-semibold text-indigo-800 mb-3">Resumen de selección</h3>
      {/* Mapear valores del estado aquí si quieres */}
    </div>
  );
}

  );
}
