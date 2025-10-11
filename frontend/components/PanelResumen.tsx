"use client";
import React from "react";

interface PanelResumenProps {
  formatoImport: string | null;
  formatoExport: string | null;
  empresa: string | null;
  fechaFactura: string;
  proyecto: string | null;
  cuenta: string | null;
  cuentaOtra: string;
  ficheroSesiones: string;
  ficheroContactos: string;
}

export const PanelResumen: React.FC<PanelResumenProps> = ({
  formatoImport,
  formatoExport,
  empresa,
  fechaFactura,
  proyecto,
  cuenta,
  cuentaOtra,
  ficheroSesiones,
  ficheroContactos,
}) => {
  return (
    <div className="bg-white/80 rounded-2xl shadow-lg p-6 backdrop-blur-sm space-y-4">
      <h3 className="text-xl font-bold text-indigo-700 text-center mb-2">
        ⚙️ Configuración actual
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          <span className="block text-gray-500">Formato de importación:</span>
          <span className="font-semibold text-indigo-700 text-lg">
            {formatoImport || "—"}
          </span>
        </div>

        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          <span className="block text-gray-500">Formato de exportación:</span>
          <span className="font-semibold text-indigo-700 text-lg">
            {formatoExport || "—"}
          </span>
        </div>

        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          <span className="block text-gray-500">Empresa:</span>
          <span className="font-semibold text-indigo-700 text-lg">
            {empresa || "—"}
          </span>
        </div>

        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          <span className="block text-gray-500">Fecha de factura:</span>
          <span className="font-semibold text-indigo-700 text-lg">
            {fechaFactura || "—"}
          </span>
        </div>

        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          <span className="block text-gray-500">Proyecto:</span>
          <span className="font-semibold text-indigo-700 text-lg">
            {proyecto || "—"}
          </span>
        </div>

        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          <span className="block text-gray-500">Cuenta contable:</span>
          <span className="font-semibold text-indigo-700 text-lg">
            {cuenta === "Otra (introducir)" ? cuentaOtra || "—" : cuenta || "—"}
          </span>
        </div>

        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          <span className="block text-gray-500">Fichero de sesiones:</span>
          <span className="font-semibold text-indigo-700 text-lg">
            {ficheroSesiones || "—"}
          </span>
        </div>

        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          <span className="block text-gray-500">Fichero de contactos:</span>
          <span className="font-semibold text-indigo-700 text-lg">
            {ficheroContactos || "—"}
          </span>
        </div>
      </div>
    </div>
  );
};
