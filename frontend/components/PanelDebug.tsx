"use client";

interface PanelDebugProps {
  passwordGlobal: string;
  apiKissoroVigente: string;
  apiEnPluralVigente: string;
  ultimoExport: string;
  totalExportaciones: number;
}

export function PanelDebug({
  passwordGlobal,
  apiKissoroVigente,
  apiEnPluralVigente,
  ultimoExport,
  totalExportaciones,
}: PanelDebugProps) {
  return (
    <div className="bg-yellow-100/80 backdrop-blur-md rounded-2xl shadow-lg p-6 space-y-4">
      <h3 className="text-xl font-bold mb-4 text-yellow-800">Panel Debug - Variables Permanentes</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-3 shadow flex flex-col">
          <span className="font-semibold text-gray-500">Contraseña Global</span>
          <span className="text-indigo-700">{passwordGlobal}</span>
        </div>
        <div className="bg-white rounded-xl p-3 shadow flex flex-col">
          <span className="font-semibold text-gray-500">API Kissoro Vigente</span>
          <span className="text-indigo-700">{apiKissoroVigente}</span>
        </div>
        <div className="bg-white rounded-xl p-3 shadow flex flex-col">
          <span className="font-semibold text-gray-500">API En Plural Vigente</span>
          <span className="text-indigo-700">{apiEnPluralVigente}</span>
        </div>
        <div className="bg-white rounded-xl p-3 shadow flex flex-col">
          <span className="font-semibold text-gray-500">Última Exportación</span>
          <span className="text-indigo-700">{ultimoExport}</span>
        </div>
        <div className="bg-white rounded-xl p-3 shadow flex flex-col">
          <span className="font-semibold text-gray-500">Total Exportaciones</span>
          <span className="text-indigo-700">{totalExportaciones}</span>
        </div>
      </div>
    </div>
  );
}
