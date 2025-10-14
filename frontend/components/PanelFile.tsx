"use client";

import React from "react";

interface PanelFileProps {
  value: string;
  onPickFileClick: () => void;
  onPickFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  disabled?: boolean;
}

export const PanelFile: React.FC<PanelFileProps> = ({
  value,
  onPickFileClick,
  onPickFile,
  fileInputRef,
  disabled = false,
}) => {
  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg p-6 transition">
      <h2 className="text-2xl font-semibold text-indigo-800 mb-4">
        Fichero de sesiones
      </h2>

      <div className="space-y-3">
        <button
          onClick={!disabled ? onPickFileClick : undefined}
          className={`w-full px-4 py-2 rounded-lg font-medium border transition ${
            disabled
              ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
              : "bg-white/90 border-indigo-500 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-900"
          }`}
        >
          {disabled ? "Deshabilitado" : "Seleccionar archivo"}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={!disabled ? onPickFile : undefined}
          disabled={disabled}
          className="hidden"
        />

        <div
          className={`text-sm mt-1 ${
            value
              ? "text-gray-700"
              : disabled
              ? "text-gray-400 italic"
              : "text-gray-400"
          }`}
        >
          {value
            ? `Archivo seleccionado: ${value}`
            : "Ningún archivo seleccionado"}
        </div>
      </div>
    </div>
  );
};
