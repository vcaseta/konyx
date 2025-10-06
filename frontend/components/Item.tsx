"use client";

interface ItemProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string; // <-- agregamos className opcional
}

export function Item({ active, onClick, children, className }: ItemProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left px-3 py-2 rounded-lg transition font-semibold
        ${active ? "bg-indigo-100 text-indigo-800 shadow-md" : "text-gray-200 hover:bg-indigo-200 hover:text-indigo-800"}
        ${className || ""}  /* <-- agregamos cualquier clase pasada desde afuera */
      `}
    >
      {children}
    </button>
  );
}
