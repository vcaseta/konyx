"use client";

export interface PanelDebugProps {
  ultimoExport: string;
  totalExportaciones: number;
  totalExportacionesFallidas: number;
  intentosLoginFallidos: number;
  apiKissoro: string;
  apiEnPlural: string;
  apiGroq: string;
  token: string;
}

export function PanelDebug({
  ultimoExport,
  totalExportaciones,
  totalExportacionesFallidas,
  intentosLoginFallidos,
  apiKissoro,
  apiEnPlural,
  apiGroq,
  token,
}: PanelDebugProps) {
  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow p-5">
      <h3 className="text-xl font-bold text-indigo-800 mb-3 text-center">Panel Debug</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
        <div className="flex justify-between border-b border-gray-200 pb-1">
          <span className="text-gray-600 font-medium">🕓 Último export:</span>
          <span className="text-gray-800 font-semibold">{ultimoExport}</span>
        </div>
        <div className="flex justify-between border-b border-gray-200 pb-1">
          <span className="text-gray-600 font-medium">📊 Total exportaciones:</span>
          <span className="text-gray-800 font-semibold">{totalExportaciones}</span>
        </div>
        <div className="flex justify-between border-b border-gray-200 pb-1">
          <span className="text-gray-600 font-medium">❌ Exportaciones fallidas:</span>
          <span className="text-gray-800 font-semibold">{totalExportacionesFallidas}</span>
        </div>
        <div className="flex justify-between border-b border-gray-200 pb-1">
          <span className="text-gray-600 font-medium">🚫 Intentos de login fallidos:</span>
          <span className="text-gray-800 font-semibold">{intentosLoginFallidos}</span>
        </div>
      </div>

      <h4 className="text-indigo-700 font-bold mt-5 mb-2 text-center text-sm">🔑 APIs y Token</h4>

      <div className="text-xs bg-gray-50 p-3 rounded-lg overflow-x-auto">
        <p className="mb-1"><strong>Kissoro:</strong> {apiKissoro || "—"}</p>
        <p className="mb-1"><strong>En Plural:</strong> {apiEnPlural || "—"}</p>
        <p className="mb-1"><strong>Groq:</strong> {apiGroq || "—"}</p>
        <p className="mt-2 text-gray-700"><strong>Token activo:</strong> {token || "—"}</p>
      </div>
    </div>
  );
}
