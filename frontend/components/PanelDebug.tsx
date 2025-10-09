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

  // Recuperamos también el token actual (sin mostrarlo completo)
  const token = typeof window !== "undefined" ? sessionStorage.getItem("konyx_token") : null;
  const tokenPreview = token ? `${token.slice(0, 10)}...${token.slice(-5)}` : "—";

  return (
    <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-md p-6 space-y-3 text-sm">
      <h3 className="text-lg font-bold mb-2 text-indigo-800">Panel Debug (diagnóstico)</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
        <div>
          <span className="font-semibold text-gray-600">🔑 Token actual:</span>{" "}
          <span className="font-mono">{tokenPreview}</span>
        </div>
        <div>
          <span className="font-semibold text-gray-600">🔐 Contraseña global:</span>{" "}
          <span className="font-mono">{passwordGlobal || "—"}</span>
        </div>

        <div>
          <span className="font-semibold text-gray-600">🌐 API Kissoro:</span>{" "}
          <span className="font-mono break-all text-indigo-700">
            {apiKissoroVigente || "—"}
          </span>
        </div>

        <div>
          <span className="font-semibold text-gray-600">🌐 API En Plural:</span>{" "}
          <span className="font-mono break-all text-indigo-700">
            {apiEnPluralVigente || "—"}
          </span>
        </div>

        <div>
          <span className="font-semibold text-gray-600">🕒 Última exportación:</span>{" "}
          <span>{ultimoExport || "—"}</span>
        </div>

        <div>
          <span className="font-semibold text-gray-600">📊 Total exportaciones:</span>{" "}
          <span>{totalExportaciones}</span>
        </div>
      </div>
    </div>
  );
}
