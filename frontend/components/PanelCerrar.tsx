"use client";

interface PanelCerrarProps {
  onConfirm: () => void;
  onCancel: () => void;
  className?: string;
}

export function PanelCerrar({ onConfirm, onCancel, className }: PanelCerrarProps) {
  return (
    <div className={`bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-lg ${className || ""}`}>
      <h3 className="text-xl font-bold mb-4">Cerrar sesión</h3>
      <p className="mb-4">¿Estás seguro de que deseas cerrar la sesión?</p>
      <div className="flex space-x-4">
        <button
          onClick={onConfirm}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 shadow transition"
        >
          Sí, cerrar
        </button>
        <button
          onClick={onCancel}
          className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 shadow transition"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
