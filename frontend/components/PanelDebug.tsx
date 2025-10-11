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
    <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-lg space-y-6">
      <h3 className="text-xl font-bold mb-4 text-indigo-800">🧩 Panel Debug</h3>

      {/* Sección métricas principales */}
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

      {/* 🔐 APIs y Token */}
      <div className="bg-gray-100 rounded-xl p-4 shadow space-y-3 text-sm break-words">
        <h4 className="text-indigo-800 font-semibold mb-2 text-center">🔐 APIs Configuradas</h4>

        <div>
          <span className="font-semibold text-gray-600">Kissoro:</span>
          <span className="ml-2 text-gray-800">{apiKissoro || "—"}</span>
        </div>

        <div>
          <span className="font-semibold text-gray-600">En Plural Psicología:</span>
          <span className="ml-2 text-gray-800">{apiEnPlural || "—"}</span>
        </div>

        <div>
          <span className="font-semibold text-gray-600">Groq (ChatGPT):</span>
          <span className="ml-2 text-gray-800">{apiGroq || "—"}</span>
        </div>

        <div className="pt-2 border-t border-gray-300 mt-2">
          <span className="font-semibold text-gray-600">Token de sesión:</span>
          <span className="ml-2 text-gray-800">{token || "—"}</span>
        </div>
      </div>
    </div>
  );
}
