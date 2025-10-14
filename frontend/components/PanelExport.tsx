"use client";

import React, { useEffect, useState } from "react";

export interface PanelExportProps {
  onConfirm: (ok: boolean) => Promise<void>;
  onReset: () => void;
}

export const PanelExport: React.FC<PanelExportProps> = ({ onConfirm, onReset }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [done, setDone] = useState(false);
  const [downloadFile, setDownloadFile] = useState<string | null>(null);

  useEffect(() => {
    const evtSource = new EventSource(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.51:8000"}/export/progress`);

    evtSource.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === "log") {
          setLogs((prev) => [...prev, data.step]);
        } else if (data.type === "end") {
          setDone(true);
          if (data.file) setDownloadFile(data.file);
          evtSource.close();
        }
      } catch (err) {
        console.error("Error parsing SSE message:", err);
      }
    };

    evtSource.onerror = () => {
      console.error("SSE connection error");
      evtSource.close();
    };

    setIsExporting(true);
    return () => evtSource.close();
  }, []);

  const handleDownload = () => {
    if (downloadFile) {
      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.51:8000"}/export/download/${downloadFile}`;
      window.open(url, "_blank");
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg p-6 space-y-4">
      <h2 className="text-2xl font-semibold text-indigo-800 mb-2">Exportación en curso</h2>

      <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 h-64 overflow-y-auto text-sm font-mono whitespace-pre-line">
        {logs.length > 0 ? (
          logs.map((log, idx) => (
            <div key={idx} className="text-gray-700">
              {log}
            </div>
          ))
        ) : (
          <div className="text-gray-400 italic">Esperando mensajes...</div>
        )}
      </div>

      {done && (
        <div className="space-y-3 pt-3 border-t border-gray-200">
          <div className="text-green-700 font-medium">✅ Exportación finalizada correctamente.</div>
          {downloadFile && (
            <button
              onClick={handleDownload}
              className="w-full px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition"
            >
              Descargar archivo ({downloadFile})
            </button>
          )}
        </div>
      )}

      {!done && isExporting && (
        <div className="flex justify-center py-2">
          <span className="animate-pulse text-indigo-600 font-medium">Procesando...</span>
        </div>
      )}

      <div className="flex justify-between pt-4 border-t border-gray-200">
        <button
          onClick={() => onConfirm(false)}
          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100"
        >
          ← Volver
        </button>
        <button
          onClick={() => {
            setLogs([]);
            setDone(false);
            onReset();
          }}
          className="px-4 py-2 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition"
        >
          Nueva exportación
        </button>
      </div>
    </div>
  );
};
