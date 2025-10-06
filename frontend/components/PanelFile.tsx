"use client";

interface PanelFileProps {
  value: string;
  onPickFileClick: () => void;
  onPickFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  className?: string; // opcional para estilos externos
}

export function PanelFile({ value, onPickFileClick, onPickFile, fileInputRef, className }: PanelFileProps) {
  return (
    <div className={`bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-lg ${className || ""}`}>
      <h3 className="text-xl font-bold mb-4">Fichero de datos</h3>
      <button
        onClick={onPickFileClick}
        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 shadow transition"
      >
        Seleccionar fichero
      </button>
      <input type="file" className="hidden" ref={fileInputRef} onChange={onPickFile} />
      {value && <p className="mt-2 text-gray-700">{value}</p>}
    </div>
  );
}
