{/* ---------------------- */}
{/* 🪄 MODAL DE PROGRESO */}
{/* ---------------------- */}
{exportStatus?.visible && (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-md text-center">
      <h3 className="text-xl font-bold text-indigo-700 mb-4">
        {exportStatus.error
          ? "❌ Error en la exportación"
          : exportStatus.finished
          ? "✅ Exportación completada"
          : "⚙️ Procesando exportación..."}
      </h3>

      {/* Logs */}
      <div className="bg-gray-100 rounded-lg p-3 text-left max-h-60 overflow-y-auto mb-4">
        {exportStatus.logs.map((log, i) => (
          <div key={i} className="text-sm text-gray-700 mb-1">
            {log}
          </div>
        ))}
      </div>

      {/* Spinner / progreso */}
      {!exportStatus.finished && !exportStatus.error && (
        <div className="flex flex-col items-center space-y-3 mb-4">
          <div className="w-10 h-10 border-4 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div className="bg-indigo-600 h-2 animate-[progressMove_2s_linear_infinite]" />
          </div>
          <style jsx>{`
            @keyframes progressMove {
              0% {
                width: 0%;
              }
              50% {
                width: 80%;
              }
              100% {
                width: 100%;
              }
            }
          `}</style>
          <div className="text-indigo-600 font-semibold animate-pulse">
            Procesando, por favor espera...
          </div>
        </div>
      )}

      {/* Resultado final */}
      {exportStatus.error && (
        <>
          <div className="text-red-600 font-semibold mb-3">{exportStatus.error}</div>
          <button
            onClick={() => setExportStatus(null)}
            className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500"
          >
            Cerrar
          </button>
        </>
      )}

      {exportStatus.finished && exportStatus.downloadUrl && (
        <div className="flex flex-col space-y-3">
          <a
            href={exportStatus.downloadUrl}
            target="_blank"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            ⬇️ Descargar CSV generado
          </a>
          <button
            onClick={() => setExportStatus(null)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Cerrar
          </button>
        </div>
      )}
    </div>
  </div>
)}
