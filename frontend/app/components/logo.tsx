export default function Logo() {
  return (
    <div className="flex items-center gap-3">
      {/* Si no tienes el PNG, sube uno como /public/logo.png */}
      <img src="/logo.png" alt="Konyx" className="h-10 w-10 rounded-md" />
      <span className="text-2xl font-semibold tracking-tight">Konyx</span>
    </div>
  );
}
