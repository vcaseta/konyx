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
    <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg p-6">
      <h3 className="text-xl font-bold mb-4 text-indigo-800">Panel de Depuración</h3>

      <div className="space-y-2 text-sm">
        <p><strong>🔐 Contraseña actual:</strong> {passwordGlobal}</p>
        <p><strong>🔑 API Kissoro:</strong> {apiKissoroVigente || "-"}</p>
        <p><strong>🔑 API En Plural:</strong> {apiEnPluralVigente || "-"}</p>
        <p><strong>📅 Última exportación:</strong> {ultimoExport}</p>
        <p><strong>📦 Total exportaciones:</strong> {totalExportaciones}</p>
      </div>
    </div>
  );
}
