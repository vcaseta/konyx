"use client";

export function ResumenInferior({ className }: { className?: string }) {
  return (
    <div className={`bg-blue-100/70 backdrop-blur-md rounded-2xl p-4 shadow-lg mt-4 ${className || ""}`}>
      <h4 className="font-semibold mb-2">Resumen</h4>
      <p className="text-gray-700">Selecciona las opciones en el panel de la izquierda para configurar la exportación.</p>
    </div>
  );
}
