"use client";

interface PanelConfigProps {
  // Password
  passActual: string;
  passNueva: string;
  passConfirma: string;
  setPassActual: (val: string) => void;
  setPassNueva: (val: string) => void;
  setPassConfirma: (val: string) => void;
  passMsg: { type: "ok" | "err"; text: string } | null;
  onCambioPassword: () => void;

  // APIs
  apiKissoroVigente: string;
  apiKissoroNuevo: string;
  setApiKissoroNuevo: (val: string) => void;
  apiKissoroMsg: { type: "ok" | "err"; text: string } | null;

  apiEnPluralVigente: string;
  apiEnPluralNuevo: string;
  setApiEnPluralNuevo: (val: string) => void;
  apiEnPluralMsg: { type: "ok" | "err"; text: string } | null;

  onCambioApis: () => void;
  className?: string; // <--- opcional para estilos externos
}

export function PanelConfig({
  passActual,
  passNueva,
  passConfirma,
  setPassActual,
  setPassNueva,
  setPassConfirma,
  passMsg,
  onCambioPassword,
  apiKissoroVigente,
  apiKissoroNuevo,
  setApiKissoroNuevo,
  apiKissoroMsg,
  apiEnPluralVigente,
  apiEnPluralNuevo,
  setApiEnPluralNuevo,
  apiEnPluralMsg,
  onCambioApis,
  className,
}: PanelConfigProps) {

  return (
    <div className={`bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-lg space-y-6 ${className || ""}`}>
      {/* Cambiar password */}
      <div>
        <h3 className="text-xl font-bold mb-4">Cambiar contraseña</h3>
        {passMsg && <p className={`mb-2 ${passMsg.type === "err" ? "text-red-600" : "text-green-600"}`}>{passMsg.text}</p>}
        <input
          type="password"
          placeholder="Contraseña actual"
          value={passActual}
          onChange={(e) => setPassActual(e.target.value)}
          className="w-full rounded-lg border border-indigo-300 px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="password"
          placeholder="Nueva contraseña"
          value={passNueva}
          onChange={(e) => setPassNueva(e.target.value)}
          className="w-full rounded-lg border border-indigo-300 px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="password"
          placeholder="Confirmar nueva contraseña"
          value={passConfirma}
          onChange={(e) => setPassConfirma(e.target.value)}
          className="w-full rounded-lg border border-indigo-300 px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={onCambioPassword}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 shadow transition"
        >
          Cambiar contraseña
        </button>
      </div>

      {/* Cambiar APIs */}
      <div>
        <h3 className="text-xl font-bold mb-4">Configuración APIs</h3>
        <div className="space-y-2">
          {/* Kissoro */}
          <div>
            <label className="block mb-1 font-semibold">API Kissoro (vigente)</label>
            <input
              type="text"
              value={apiKissoroNuevo || apiKissoroVigente}
              onChange={(e) => setApiKissoroNuevo(e.target.value)}
              className="w-full rounded-lg border border-indigo-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {apiKissoroMsg && <p className={`mt-1 ${apiKissoroMsg.type === "err" ? "text-red-600" : "text-green-600"}`}>{apiKissoroMsg.text}</p>}
          </div>

          {/* En Plural */}
          <div className="mt-4">
            <label className="block mb-1 font-semibold">API En Plural (vigente)</label>
            <input
              type="text"
              value={apiEnPluralNuevo || apiEnPluralVigente}
              onChange={(e) => setApiEnPluralNuevo(e.target.value)}
              className="w-full rounded-lg border border-indigo-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {apiEnPluralMsg && <p className={`mt-1 ${apiEnPluralMsg.type === "err" ? "text-red-600" : "text-green-600"}`}>{apiEnPluralMsg.text}</p>}
          </div>

          <button
            onClick={onCambioApis}
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 shadow transition"
          >
            Actualizar APIs
          </button>
        </div>
      </div>
    </div>
  );
}

