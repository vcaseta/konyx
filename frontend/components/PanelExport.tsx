"use client";

interface PanelExportProps {
  onConfirm: (ok: boolean) => void;
  className?: string; // opcional para estilos externos
}

export function PanelExport({ onConfirm, className }: PanelExportProps) {
  return (
    <div className={`bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-lg ${className || ""}`}>
      <h3 className="text-xl font-bold mb-4">Confirmar Exportación</h3>
      <p className="mb-4">¿Deseas iniciar la exportación de los datos seleccionados?</p>
      <div className="flex space-x-4">
        <button
          onClick={() => onConfirm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 shadow transition"
        >
          Sí
        </button>
        <button
          onClick={() => onConfirm(false)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 shadow transition"
        >
          No
        </button>
      </div>
    </div>
  );
}
