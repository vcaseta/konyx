"use client";
import React from "react";

interface PanelNumeroFacturaProps {
  value: string;
  onChange: (val: string) => void;
  useAutoNumbering: boolean;
  onToggleAutoNumbering: (val: boolean) => void;
}

export const PanelNumeroFactura: React.FC<PanelNumeroFacturaProps> = ({
  value,
  onChange,
  useAutoNumbering,
  onToggleAutoNumbering,
}) => {
  return (
    <div className="bg-white/80 rounded-2xl shadow-lg p-6 backdrop-blur-sm space-y-4">
      <h3 className="text-xl font-bold text-indigo-700 text-center">
        Número de factura inicial
      </h3>

      <div className="flex flex-col items-start space-y-4">
        {/* ✅ Checkbox numeración automática */}
        <label
          htmlFor="autoNumbering"
          className="flex items-center space-x-2 text-sm font-medium text-gray-700 select-none"
        >
          <input
            id="autoNumbering"
            type="checkbox"
            checked={useAutoNumbering}
            onChange={(e) => onToggleAutoNumbering(e.target.checked)}
            className="accent-indigo-600 w-4 h-4 rounded border-gray-300 focus:ring-indigo-500"
          />
          <span>Usar numeración automática</span>
        </label>

        {/* ✅ Campo número de factura */}
        <div className="w-full">
          <label
            htmlFor="numeroFactura"
            className="text-gray-600 text-sm font-medium block mb-1"
          >
            Introduce el número a partir del cual se generarán las facturas:
          </label>

          <input
            id="numeroFactura"
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Ejemplo: F250045"
            disabled={!useAutoNumbering}
            className={`w-full rounded-lg border px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
              useAutoNumbering
                ? "border-indigo-300 text-indigo-700"
                : "border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed opacity-70"
            }`}
          />

          <p className="text-sm text-gray-500 mt-1">
            {useAutoNumbering
              ? "Las facturas se numerarán de forma correlativa a partir de este número."
              : "Si está desactivado, no se usará numeración automática y Holded asignará la numeración (factura en borrador)."}
          </p>
        </div>
      </div>
    </div>
  );
};

