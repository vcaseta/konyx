"use client";

interface PanelDebugProps {
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
    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg">
      <h3 className="text-xl font-bold text-indigo-800 mb-4 text-center">🧩 Panel de Depuración</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6 text-sm text-gray-700">
        <div className="flex justify-between border-b border-gray-200 pb-1">
          <span className="font-semibold text-gray-600">🕒 Último export:</span>
          <span className="text-indigo-700">{ultimoExport}</span>
        </div>

        <div className="flex justify-between border-b border-gray-200 pb-1">
          <span className="font-semibold text-gray-600">📦 Exportaciones:</span>
          <span className="text-indigo-700">{totalExportaciones}</span>
        </div>

        <div className="flex justify-between border-b border-gray-200 pb-1">
          <span className="font-semibold text-gray-600">❌ Fallidas:</span>
          <span className="text-red-600">{totalExportacionesFallidas}</span>
        </div>

        <div className="flex justify-between border-b border-gray-200 pb-1">
          <span className="font-semibold text-gray-600">🚫 Logins fallidos:</span>
          <span className="text-orange-600">{intentosLoginFallidos}</span>
        </div>

        <div className="col-span-full mt-3 border-t border-gray-300 pt-2">
          <h4 className="font-semibold text-indigo-700 mb-2">🔗 Claves de API</h4>

          <div className="text-xs text-gray-600 space-y-1">
            <div className="flex justify-between border-b border-gray-200 pb-1">
              <span>Kissoro:</span>
              <span className="text-indigo-700 truncate max-w-[60%]">{apiKissoro || "—"}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-1">
              <span>En Plural:</span>
              <span className="text-indigo-700 truncate max-w-[60%]">{apiEnPlural || "—"}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-1">
              <span>Groq:</span>
              <span className="text-indigo-700 truncate max-w-[60%]">{apiGroq || "—"}</span>
            </div>
          </div>
        </div>

        <div className="col-span-full mt-4 border-t border-gray-300 pt-2">
          <h4 className="font-semibold text-indigo-700 mb-2">🔑 Token de sesión</h4>
          <div className="bg-gray-100 p-2 rounded-lg text-xs font-mono text-gray-800 break-all">
            {token || "—"}
          </div>
        </div>
      </div>
    </div>
  );
}
