"use client";

interface PanelOptionProps<T extends string> {
  title: string;
  options: readonly T[];
  value: T | null;
  onChange: (val: T) => void;
  children?: React.ReactNode;
  className?: string; // opcional para estilos externos
}

export function PanelOption<T extends string>({
  title,
  options,
  value,
  onChange,
  children,
  className,
}: PanelOptionProps<T>) {

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value as T;
    if (options.includes(selected)) {
      onChange(selected);
    }
  };

  return (
    <div className={`bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-lg ${className || ""}`}>
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <select
        className="w-full rounded-lg border border-indigo-300 px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        value={value || ""}
        onChange={handleChange}
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
