"use client";

interface PanelDebugProps {
  ultimoExport: string;
  totalExportaciones: number;
  totalExportacionesFallidas: number;
  intentosLoginFallidos: number;
}

export function PanelDebug({
  ultimoExport,
  totalExportaciones,
  totalExportacionesFallidas,
  intentosLoginFallidos,
}: PanelDebugProps) {
  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-lg space-y-6">
      <h3 className="text-xl font-bold mb-4 text-indigo-800">🧩 Panel Debug</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* ✅ Total exportaciones */}
        <div className="bg-green-100 rounded-xl p-4 shadow flex flex-col items-center justify-center text-center">
          <span className="text-gray-600 font-semibold">✅ Total exportaciones</span>
          <span className="block text-3xl font-bold text-green-700 mt-2">
            {totalExportaciones}
          </span>
        </div>

        {/* ❌ Exportaciones fallidas */}
        <div className="bg-red-100 rounded-xl p-4 shadow flex flex-col items-center justify-center text-center">
          <span className="text-gray-600 font-semibold">❌ Exportaciones fallidas</span>
          <span className="block text-3xl font-bold text-red-700 mt-2">
            {totalExportacionesFallidas}
          </span>
        </div>

        {/* 📅 Última exportación */}
        <div className="bg-blue-100 rounded-xl p-4 shadow flex flex-col items-center justify-center text-center">
          <span className="text-gray-600 font-semibold">📅 Última exportación</span>
          <span className="block text-lg font-bold text-blue-700 mt-2">
            {ultimoExport || "-"}
          </span>
        </div>
      </div>

      {/* ⚠️ Intentos fallidos de login */}
      <div className="bg-yellow-100 rounded-xl p-4 shadow flex flex-col items-center justify-center text-center">
        <span className="text-gray-600 font-semibold">⚠️ Intentos de login fallidos</span>
        <span className="block text-3xl font-bold text-yellow-700 mt-2">
          {intentosLoginFallidos}
        </span>
      </div>
    </div>
  );
}
