"use client";
import React from "react";

interface PanelNumeroFacturaProps {
  value: string;
  onChange: (val: string) => void;
}

export const PanelNumeroFactura: React.FC<PanelNumeroFacturaProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="bg-white/80 rounded-2xl shadow-lg p-6 backdrop-blur-sm space-y-3">
      <h3 className="text-xl font-bold text-indigo-700 text-center mb-2">
        Número de factura inicial
      </h3>

      <div className="flex flex-col items-start space-y-2">
        <label className="text-gray-600 text-sm font-medium">
          Introduce el número a partir del cual se generarán las facturas:
        </label>
        <input
          type="number"
          min="1"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ejemplo: 125"
          className="w-full rounded-lg border border-indigo-300 px-3 py-2 text-indigo-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
        <p className="text-sm text-gray-500">
          Las facturas se numerarán de forma correlativa a partir de este número.
        </p>
      </div>
    </div>
  );
};
