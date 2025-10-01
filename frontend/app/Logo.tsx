"use client";

export default function Logo() {
  return (
    <div className="flex items-center gap-3">
      <img
        src="/logo.png"
        alt="Konyx"
        className="w-12 h-12 rounded-xl"
      />
      <span className="text-2xl font-bold tracking-wide">Konyx</span>
    </div>
  );
}
