"use client";
import React from "react";

interface PanelDebugProps {
  ultimoExport: string;
  totalExportaciones: number;
  totalExportacionesFallidas: number;
  intentosLoginFallidos: number;
  totalLogins: number;
  token: string;
}

export const PanelDebug: React.FC<PanelDebugProps> = ({
  ultimoExport,
  totalExportaciones,
  totalExportacionesFallidas,
  intentosLoginFallidos,
  totalLogins,
  token,
}) => {
  return (
    <div className="bg-slate-100/90 border border-slate-300 rounded-2xl shadow-sm p-6 backdrop-blur-sm">
      {/* Línea superior decorativa */}
      <div className="relative mb-6">
        <div className="absolute inset-x-0 top-1/2 border-t border-slate-300"></div>
        <h3 className="relative inline-block px-4 bg-slate-100/90 text-sm font-semibold text-slate-600 left-1/2 -translate-x-1/2">
          Estado del sistema
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div className="bg-white/70 border border-slate-200 rounded-lg p-3">
          <span className="block text-slate-500">Último export realizado</span>
          <span className="font-semibold text-slate-800">{ultimoExport || "—"}</span>
        </div>

        <div className="bg-white/70 border border-slate-200 rounded-lg p-3">
          <span className="block text-slate-500">Exportaciones correctas</span>
          <span className="font-semibold text-slate-800">{totalExportaciones}</span>
        </div>

        <div className="bg-white/70 border border-slate-200 rounded-lg p-3">
          <span className="block text-slate-500">Exportaciones fallidas</span>
          <span className="font-semibold text-slate-800">{totalExportacionesFallidas}</span>
        </div>

        <div className="bg-white/70 border border-slate-200 rounded-lg p-3">
          <span className="block text-slate-500">Intentos de login fallidos</span>
          <span className="font-semibold text-slate-800">{intentosLoginFallidos}</span>
        </div>

        <div className="bg-white/70 border border-slate-200 rounded-lg p-3">
          <span className="block text-slate-500">Total logins exitosos</span>
          <span className="font-semibold text-slate-800">{totalLogins}</span>
        </div>

        <div className="bg-white/70 border border-slate-200 rounded-lg p-3 col-span-full">
          <span className="block text-slate-500">Token activo</span>
          <span className="font-mono text-xs text-slate-700 break-all">{token}</span>
        </div>
      </div>
    </div>
  );
};
