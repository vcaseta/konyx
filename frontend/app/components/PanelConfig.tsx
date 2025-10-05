"use client";

interface PanelConfigProps {
  passActual: string;
  passNueva: string;
  passConfirma: string;
  setPassActual: (val: string) => void;
  setPassNueva: (val: string) => void;
  setPassConfirma: (val: string) => void;
  passMsg: { type: "ok" | "err"; text: string } | null;
  onCambioPassword: () => void;

  apiKissoroVigente: string;
  apiKissoroNuevo: string;
  setApiKissoroNuevo: (val: string) => void;
  apiKissoroMsg: { type: "ok" | "err"; text: string } | null;

  apiEnPluralVigente: string;
  apiEnPluralNuevo: string;
  setApiEnPluralNuevo: (val: string) => void;
  apiEnPluralMsg: { type: "ok" | "err"; text: string } | null;

  onCambioApis: () => void;
}

export function PanelConfig({
  passActual, passNueva, passConfirma, setPassActual, setPassNueva, setPassConfirma,
  passMsg, onCambioPassword,
  apiKissoroVigente, apiKissoroNuevo, setApiKissoroNuevo, apiKissoroMsg,
  apiEnPluralVigente, apiEnPluralNuevo, setApiEnPluralNuevo, apiEnPluralMsg,
  onCambioApis,
}: PanelConfigProps) {
  return (
    <div className="bg-white/80 rounded-xl p-6 shadow-md space-y-6">
      <h3 className="text-xl font-bold mb-4">Configuración</h3>

      {/* Cambio de contraseña */}
      <div className="space-y-2">
        <h4 className="font-semibold">Cambio de contraseña</h4>
        <input type="password" placeholder="Contraseña actual" value={passActual} onChange={e => setPassActual(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        <input type="password" placeholder="Nueva contraseña" value={passNueva} onChange={e => setPassNueva(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        <input type="password" placeholder="Confirmar nueva" value={passConfirma} onChange={e => setPassConfirma(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        <button onClick={onCambioPassword} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition mt-2">Cambio</button>
        {passMsg && <p className={passMsg.type === "ok" ? "text-green-600" : "text-red-600"}>{passMsg.text}</p>}
      </div>

      {/* Cambio de APIs */}
      <div className="space-y-2">
        <h4 className="font-semibold">APIs Holded</h4>
        <div>
          <p className="text-gray-600">Kissoro (actual): {apiKissoroVigente}</p>
          <input type="text" placeholder="Nueva API Kissoro" value={apiKissoroNuevo} onChange={e => setApiKissoroNuevo(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <button onClick={onCambioApis} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition mt-1">Cambio</button>
          {apiKissoroMsg && <p className={apiKissoroMsg.type === "ok" ? "text-green-600" : "text-red-600"}>{apiKissoroMsg.text}</p>}
        </div>
        <div>
          <p className="text-gray-600">En Plural (actual): {apiEnPluralVigente}</p>
          <input type="text" placeholder="Nueva API En Plural" value={apiEnPluralNuevo} onChange={e => setApiEnPluralNuevo(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          {apiEnPluralMsg && <p className={apiEnPluralMsg.type === "ok" ? "text-green-600" : "text-red-600"}>{apiEnPluralMsg.text}</p>}
        </div>
      </div>
    </div>
  );
}
