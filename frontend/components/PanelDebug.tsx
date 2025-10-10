"use client";

interface PanelDebugProps {
  passwordGlobal: string;
  apiKissoroVigente: string;
  apiEnPluralVigente: string;
  ultimoExport: string;
  totalExportaciones: number;
  totalExportacionesFallidas: number; // ✅ nuevo
  intentosLoginFallidos: number; // ✅ nuevo
}

export function PanelDebug({
  passwordGlobal,
  apiKissoroVigente,
  apiEnPluralVigente,
  ultimoExport,
  totalExportaciones,
  totalExportacionesFallidas,
  intentosLoginFallidos,
}: PanelDebugProps) {
  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-lg space-y-6">
      <h3 className="text-xl font-bold mb-4 text-indigo-800">🧩 Panel Debug</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Contraseña */}
        <div className="bg-gray-100 rounded-xl p-4 shadow">
          <span className="text-gray-600 font-semibold">🔐 Contraseña global</span>
          <span className="block text-lg font-bold text-gray-800 mt-2">
            {passwordGlobal || "-"}
          </span>
        </div>

        {/* API Kissoro */}
        <div className="bg-gray-100 rounded-xl p-4 shadow">
          <span className="text-gray-600 font-semibold">🌐 API Kissoro</span>
          <span className="block text-sm text-indigo-700 mt-2 truncate">
            {apiKissoroVigente || "-"}
          </span>
        </div>

        {/* API En Plural */}
        <div className="bg-gray-100 rounded-xl p-4 shadow">
          <span className="text-gray-600 font-semibold">🌐 API En Plural</span>
          <span className="block text-sm text-indigo-700 mt-2 truncate">
            {apiEnPluralVigente || "-"}
          </span>
        </div>
      </div>

      {/* Exportaciones */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-100 rounded-xl p-4 shadow">
          <span className="text-gray-600 font-semibold">✅ Total exportaciones</span>
          <span className="block text-2xl font-bold text-green-700 mt-2">
            {totalExportaciones}
          </span>
        </div>

        <div className="bg-red-100 rounded-xl p-4 shadow">
          <span className="text-gray-600 font-semibold">❌ Exportaciones fallidas</span>
          <span className="block text-2xl font-bold text-red-700 mt-2">
            {totalExportacionesFallidas}
          </span>
        </div>

        <div className="bg-blue-100 rounded-xl p-4 shadow">
          <span className="text-gray-600 font-semibold">📅 Última exportación</span>
          <span className="block text-lg font-bold text-blue-700 mt-2">
            {ultimoExport || "-"}
          </span>
        </div>
      </div>

      {/* Intentos de login */}
      <div className="bg-yellow-100 rounded-xl p-4 shadow">
        <span className="text-gray-600 font-semibold">⚠️ Intentos de login fallidos</span>
        <span className="block text-2xl font-bold text-yellow-700 mt-2">
          {intentosLoginFallidos}
        </span>
      </div>
    </div>
  );
}
