"use client";
import React, { useEffect, useState } from "react";

interface PanelExportProps {
  onConfirm: (ok: boolean) => void;
  onReset: () => void; // 🔄 Nuevo: limpiar datos y volver al inicio
}

interface Change {
  columna: string;
  valor_original: string;
  valor_corregido: string;
}

export const PanelExport: React.FC<PanelExportProps> = ({ onConfirm, onReset }) => {
  const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.51:8000";

  const [logs, setLogs] = useState<string[]>([]);
  const [changes, setChanges] = useState<Change[]>([]);
  const [finished, setFinished] = useState(false);
  const [filename, setFilename] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 🔄 Escucha en tiempo real del progreso SSE
  useEffect(() => {
    const source = new EventSource(`${BACKEND}/export/progress`);

    source.onmessage = (event) => {
      if (!event.data) return;
      const data = JSON.parse(event.data);

      if (data.type === "log") {
        setLogs((prev) => [...prev, data.step]);
      } else if (data.type === "changes") {
        setChanges(data.changes || []);
      }
    };

    source.addEventListener("end", () => {
      setFinished(true);
      source.close();
    });

    return () => source.close();
  }, [BACKEND]);

  // ⬇️ Descargar Excel generado
  const handleDownload = async () => {
    if (!filename) {
      setError("Archivo no disponible para descargar todavía.");
      return;
    }

    try {
      const response = await fetch(`${BACKEND}/export/download/${filename}`);
      if (!response.ok) throw new Error("No se pudo descargar el archivo.");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);

      setLogs((prev) => [...prev, "✅ Archivo descargado correctamente."]);
    } catch (err) {
      console.error(err);
      setError("Error al descargar el archivo.");
    }
  };

  // 🔍 Obtener nombre del archivo generado (desde el backend)
  useEffect(() => {
    const checkResult = async () => {
      try {
        const res = await fetch(`${BACKEND}/auth/status`);
        if (res.ok) {
          const data = await res.json();
          if (data?.archivo_generado) {
            setFilename(data.archivo_generado);
          }
        }
      } catch {
        /* ignore */
      }
    };
    checkResult();
  }, [BACKEND]);

  // 🧹 Reiniciar para nueva exportación
  const handleNewExport = () => {
    setLogs([]);
    setChanges([]);
    setFinished(false);
    setFilename(null);
    setError(null);
    onReset(); // Llama al Dashboard para reiniciar selección
  };

  return (
    <div className="bg-white/80 rounded-2xl shadow-lg p-6 space-y-5">
      <h3 className="text-xl font-bold text-indigo-700 text-center">
        🚀 Exportación en curso
      </h3>

      {/* Logs */}
      <div className="bg-gray-100 rounded-lg p-3 max-h-56 overflow-y-auto text-sm border border-gray-200">
        {logs.length > 0 ? (
          logs.map((log, i) => (
            <div key={i} className="text-gray-700 mb-1">
              {log}
            </div>
          ))
        ) : (
          <div className="text-gray-400 italic">Esperando progreso...</div>
        )}
      </div>

      {/* Cambios IA */}
      {changes.length > 0 && (
        <div className="mt-4">
          <h4 className="text-md font-bold text-indigo-700 mb-2 text-center">
            🧠 Cambios aplicados por Groq
          </h4>
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-indigo-100 text-indigo-800">
                <tr>
                  <th className="border p-2">Columna</th>
                  <th className="border p-2">Valor original</th>
                  <th className="border p-2">Valor corregido</th>
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

      {/* Acciones finales */}
      <div className="flex flex-col md:flex-row justify-center gap-4 mt-6">
        {finished && (
          <>
            <button
              onClick={handleDownload}
              className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition shadow"
            >
              ⬇️ Descargar Excel
            </button>
            <button
              onClick={handleNewExport}
              className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition shadow"
            >
              🔄 Nueva exportación
            </button>
          </>
        )}
        {!finished && (
          <div className="text-indigo-600 font-semibold animate-pulse text-center">
            Procesando...
          </div>
        )}
      </div>

      {error && <p className="text-red-600 text-sm text-center mt-2">{error}</p>}
    </div>
  );
};
