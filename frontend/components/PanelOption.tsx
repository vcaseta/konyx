"use client";

import { useEffect, useState } from "react";

interface PanelOptionProps<T extends string> {
  title: string;
  options: readonly T[];
  value: T | null;
  onChange: (val: T) => void;
  children?: React.ReactNode;
}

/**
 * Componente reutilizable para selección visual de opciones
 * - Reemplaza los select por tarjetas clicables
 * - Soporta caso "Otra (introducir)" con input visible automáticamente
 */
export default function PanelOption<T extends string>({
  title,
  options,
  value,
  onChange,
  children,
}: PanelOptionProps<T>) {
  const [mostrarInputOtra, setMostrarInputOtra] = useState(false);

  useEffect(() => {
    setMostrarInputOtra(value === "Otra (introducir)");
  }, [value]);

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-lg">
      <h3 className="text-xl font-bold mb-4">{title}</h3>

      {/* Grid de opciones tipo “chips” */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        {options.map((opt) => {
          const active = value === opt;
          return (
            <button
              key={opt}
              onClick={() => onChange(opt)}
              className={`px-4 py-3 rounded-xl text-center font-semibold transition border-2 select-none
                ${active
                  ? "border-indigo-600 bg-indigo-100 text-indigo-800 shadow"
                  : "border-gray-300 bg-white text-gray-700 hover:border-indigo-400 hover:bg-indigo-50"
                }`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {/* Si hay contenido adicional o “Otra (introducir)” */}
      {mostrarInputOtra && (
        <div className="mt-4">{children}</div>
      )}
    </div>
  );
}

