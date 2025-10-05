"use client";

interface PanelDateProps {
  title: string;
  value: string;
  onChange: (val: string) => void;
}

export function PanelDate({ title, value, onChange }: PanelDateProps) {
  return (
    <div className="bg-white/80 rounded-xl p-6 shadow-md">
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <input
        type="date"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  );
}
