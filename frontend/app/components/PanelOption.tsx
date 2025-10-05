"use client";

interface PanelOptionProps<T> {
  title: string;
  options: readonly T[];
  value: T | null;
  onChange: (val: T) => void;
  children?: React.ReactNode;
}

export function PanelOption<T extends string>({ title, options, value, onChange, children }: PanelOptionProps<T>) {
  return (
    <div className="bg-white/80 rounded-xl p-6 shadow-md">
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <select
        className="w-full rounded-lg border border-gray-300 px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        value={value || ""}
        onChange={e => onChange(e.target.value as T)}
      >
        <option value="" disabled>Selecciona {title}</option>
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      {children}
    </div>
  );
}
