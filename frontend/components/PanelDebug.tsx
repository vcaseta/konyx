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
    <div
      className="rounded-2xl shadow-md p-6 backdrop-blur-sm border border-slate-700 text-slate-200"
      style={{ backgroundColor: "#26252d" }}
    >
      {/* Título alineado a la izquierda */}
      <h3 className="text-sm font-semibold text-slate-300 mb-4 border-b border-slate-600 pb-1">
        Estado del sistema
      </h3>

      {/* Rejilla 3 columnas compacta */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
        <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-3 transition hover:bg-slate-700/40">
          <span className="block text-slate-400">Último export</span>
          <span className="font-semibold">{ultimoExport || "—"}</span>
        </div>

        <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-3 transition hover:bg-slate-700/40">
          <span className="block text-slate-400">Exportaciones OK</span>
          <span className="font-semibold">{totalExportaciones}</span>
        </div>

        <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-3 transition hover:bg-slate-700/40">
          <span className="block text-slate-400">Exportaciones fallidas</span>
          <span className="font-semibold">{totalExportacionesFallidas}</span>
        </div>

        <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-3 transition hover:bg-slate-700/40">
          <span className="block text-slate-400">Logins exitosos</span>
          <span className="font-semibold">{totalLogins}</span>
        </div>

        <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-3 transition hover:bg-slate-700/40">
          <span className="block text-slate-400">Intentos fallidos</span>
          <span className="font-semibold">{intentosLoginFallidos}</span>
        </div>

        <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-3 sm:col-span-3 transition hover:bg-slate-700/40">
          <span className="block text-slate-400">Token activo</span>
          <span className="font-mono text-xs break-all">{token}</span>
        </div>
      </div>
    </div>
  );
};
