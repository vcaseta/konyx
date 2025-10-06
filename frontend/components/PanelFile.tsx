"use client";

interface PanelFileProps {
  value: string;
  onPickFileClick: () => void;
  onPickFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

export function PanelFile({ value, onPickFileClick, onPickFile, fileInputRef }: PanelFileProps) {
  return (
    <div className="bg-white/80 rounded-xl p-6 shadow-md">
      <h3 className="text-xl font-bold mb-4">Fichero de datos</h3>
      <button
        onClick={onPickFileClick}
        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
      >
        Seleccionar fichero
      </button>
      <input type="file" className="hidden" ref={fileInputRef} onChange={onPickFile} />
      {value && <p className="mt-2 text-gray-700">{value}</p>}
    </div>
  );
}
