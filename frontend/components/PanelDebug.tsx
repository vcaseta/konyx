"use client";

interface PanelDebugProps {
  passwordGlobal: string;
  apiKissoroVigente: string;
  apiEnPluralVigente: string;
  ultimoExport: string;
  totalExportaciones: number;
  totalExportacionesFallidas: number;
  intentosLoginFallidos: number;
}

export function PanelDebug({
  passwordGlobal,
  apiKissoroVigente,
  apiEnPluralVigente,
  ultimoExport,
  totalExportaciones,
  totalExportacionesFallidas,
  intentosLoginFallidos,
}: PanelDebugProps) {
  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-lg">
      <h3 className="text-xl font-bold mb-6 text-indigo-800 text-center">
        🧩 Panel Debug
      </h3>

      {/* 🔐 Configuración general */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <InfoCard
          title="🔐 Contraseña global"
          value={passwordGlobal || "-"}
          color="gray"
          valueSize="text-lg"
        />
        <InfoCard
          title="🌐 API Kissoro"
          value={apiKissoroVigente || "-"}
          color="indigo"
          valueSize="text-sm"
          truncate
        />
        <InfoCard
          title="🌐 API En Plural"
          value={apiEnPluralVigente || "-"}
          color="indigo"
          valueSize="text-sm"
          truncate
        />
      </div>

      {/* 📊 Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <InfoCard
          title="✅ Total exportaciones"
          value={totalExportaciones}
          color="green"
          valueSize="text-2xl"
        />
        <InfoCard
          title="❌ Exportaciones fallidas"
          value={totalExportacionesFallidas}
          color="red"
          valueSize="text-2xl"
        />
        <InfoCard
          title="📅 Última exportación"
          value={ultimoExport || "-"}
          color="blue"
          valueSize="text-lg"
        />
        <InfoCard
          title="⚠️ Intentos login fallidos"
          value={intentosLoginFallidos}
          color="yellow"
          valueSize="text-2xl"
        />
      </div>
    </div>
  );
}

/* -----------------------------
   🔧 Subcomponente genérico InfoCard
----------------------------- */
interface InfoCardProps {
  title: string;
  value: string | number;
  color: "gray" | "green" | "red" | "blue" | "yellow" | "indigo";
  valueSize?: string;
  truncate?: boolean;
}

function InfoCard({
  title,
  value,
  color,
  valueSize = "text-base",
  truncate = false,
}: InfoCardProps) {
  const bgColor =
    color === "gray"
      ? "bg-gray-100 text-gray-800"
      : color === "green"
      ? "bg-green-100 text-green-800"
      : color === "red"
      ? "bg-red-100 text-red-800"
      : color === "blue"
      ? "bg-blue-100 text-blue-800"
      : color === "yellow"
      ? "bg-yellow-100 text-yellow-800"
      : "bg-indigo-100 text-indigo-800";

  return (
    <div className={`${bgColor} rounded-xl p-4 shadow`}>
      <span className="text-gray-600 font-semibold">{title}</span>
      <span
        className={`block mt-2 font-bold ${valueSize} ${
          truncate ? "truncate max-w-full" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}
