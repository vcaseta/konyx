"use client";

interface PanelDateProps {
  title: string;
  value: string;
  onChange: (val: string) => void;
  className?: string; // opcional para estilos externos
}

export function PanelDate({ title, value, onChange, className }: PanelDateProps) {
  return (
    <div className={`bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-lg ${className || ""}`}>
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <input
        type="date"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full rounded-lg border border-indigo-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  );
}
