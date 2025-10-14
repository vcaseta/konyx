// components/PanelExport.tsx
"use client";
import React, { useEffect, useState } from "react";

interface PanelExportProps {
  onReset: () => void;
}

interface Change {
  columna: string;
  valor_original: string;
  valor_corregido: string;
}

export const PanelExport: React.FC<PanelExportProps> = ({ onReset }) => {
  const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.51:8000";
  const [logs, setLogs] = useState<string[]>([]);
  const [changes, setChanges] = useState<Change[]>([]);
  const [finished, setFinished] = useState(false);
  const [filename, setFilename] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 🔄 Solo escucha SSE (NO hace POST)
  useEffect(() => {
    const source = new EventSource(`${BACKEND}/export/progress`);
    source.onmessage = (event) => {
      if (!event.data) return;
      try {
        const data = JSON.parse(event.data);
        if (data.type === "log") setLogs((p) => [...p, data.step]);
        if (data.type === "changes") setChanges(data.changes || []);
        if (data.type === "end") {
          if (data.file) {
            setLogs((p) => [...p, `💾 Archivo generado: ${data.file}`]);
            setFilename(data.file);
          }
          setFinished(true);
        }
      } catch { /* ignore */ }
    };
    return () => source.close();
  }, [BACKEND]);

  const handleDownload = async () => {
    if (!filename) { setError("Archivo no disponible todavía."); return; }
    try {
      const res = await fetch(`${BACKEND}/export/download/${filename}`);
      if (!res.ok) throw new Error("No se pudo descargar el archivo.");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = filename; a.click();
      URL.revokeObjectURL(url);
      setLogs((p) => [...p, "✅ Archivo descargado correctamente."]);
    } catch (e) { setError("Error al descargar el archivo."); }
  };

  const handleNewExport = async () => {
    try { await fetch(`${BACKEND}/export/reset`, { method: "POST" }); } catch {}
    setLogs([]); setChanges([]); setFinished(false); setFilename(null); setError(null);
    onReset();
  };

  return (
    <div className="bg-white/80 rounded-2xl shadow-lg p-6 space-y-5">
      <h3 className="text-xl font-bold text-indigo-700 text-center">🚀 Exportación en curso</h3>
      <div className="bg-gray-100 rounded-lg p-3 max-h-56 overflow-y-auto text-sm border border-gray-200">
        {logs.length ? logs.map((log, i) => (
          <div key={i} className={`mb-1 ${log.includes("💾") ? "text-green-600 font-semibold" : "text-gray-700"}`}>
            {log}
          </div>
        )) : <div className="text-gray-400 italic">Esperando progreso...</div>}
      </div>

      {changes.length > 0 && (
        <div className="mt-4">
          <h4 className="text-md font-bold text-indigo-700 mb-2 text-center">🧠 Cambios aplicados</h4>
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-indigo-100 text-indigo-800">
                <tr>
                  <th className="border p-2">Columna</th>
                  <th className="border p-2">Original</th>
                  <th className="border p-2">Corregido</th>
                </tr>
              </thead>
              <tbody>
                {changes.map((c, i) => (
                  <tr key={i} className="bg-white even:bg-gray-50">
                    <td className="border p-2">{c.columna}</td>
                    <td className="border p-2 text-gray-500">{c.valor_original}</td>
                    <td className="border p-2 text-indigo-700 font-semibold">{c.valor_corregido}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-center gap-4 mt-6">
        {finished ? (
          <>
            <button onClick={handleDownload} className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition shadow">
              ⬇️ Descargar CSV
            </button>
            <button onClick={handleNewExport} className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition shadow">
              🔄 Nueva exportación
            </button>
          </>
        ) : (
          <div className="text-indigo-600 font-semibold animate-pulse text-center">Procesando...</div>
        )}
      </div>

      {error && <p className="text-red-600 text-sm text-center mt-2">{error}</p>}
    </div>
  );
};
