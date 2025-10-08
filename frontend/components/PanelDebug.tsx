"use client";

interface PanelDebugProps {
  passwordGlobal: string;
  apiKissoroVigente: string;
  apiEnPluralVigente: string;
  ultimoExport: string;
  totalExportaciones: number;
}

export function PanelDebug({ passwordGlobal, apiKissoroVigente, apiEnPluralVigente, ultimoExport, totalExportaciones }: PanelDebugProps) {
  return (
    <div className="bg-blue-100/90 rounded-2xl p-4 shadow-lg space-y-2">
      <h4 className="font-semibold text-lg mb-2">Debug Panel</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div><span className="font-semibold">Contraseña:</span> {passwordGlobal}</div>
        <div><span className="font-semibold">API Kissoro:</span> {apiKissoroVigente}</div>
        <div><span className="font-semibold">API En Plural:</span> {apiEnPluralVigente}</div>
        <div><span className="font-semibold">Última exportación:</span> {ultimoExport}</div>
        <div><span className="font-semibold">Total exportaciones:</span> {totalExportaciones}</div>
      </div>
    </div>
  );
}

