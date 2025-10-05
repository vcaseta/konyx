"use client";

interface PanelCerrarProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export function PanelCerrar({ onConfirm, onCancel }: PanelCerrarProps) {
  return (
    <div className="bg-white/80 rounded-xl p-6 shadow-md">
      <h3 className="text-xl font-bold mb-4">Cerrar sesión</h3>
      <p className="mb-4">¿Estás seguro de que deseas cerrar la sesión?</p>
      <div className="flex space-x-4">
        <button onClick={onConfirm} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">Sí, cerrar</button>
        <button onClick={onCancel} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition">Cancelar</button>
      </div>
    </div>
  );
}
