"use client";

interface PanelConfigProps {
  passActual: string;
  passNueva: string;
  passConfirma: string;
  setPassActual: (val: string) => void;
  setPassNueva: (val: string) => void;
  setPassConfirma: (val: string) => void;
  passMsg: { type: "ok" | "err"; text: string } | null;
  setPassMsg: (msg: { type: "ok" | "err"; text: string } | null) => void;
  passwordGlobal: string;
  setPasswordGlobal: (val: string) => void;
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
  passActual, passNueva, passConfirma,
  setPassActual, setPassNueva, setPassConfirma,
  passMsg, setPassMsg,
  passwordGlobal, setPasswordGlobal,
  apiKissoroVigente, apiKissoroNuevo, setApiKissoroNuevo, apiKissoroMsg,
  apiEnPluralVigente, apiEnPluralNuevo, setApiEnPluralNuevo, apiEnPluralMsg,
  onCambioApis
}: PanelConfigProps) {

  const handleCambioPassword = () => {
    setPassMsg(null);
    if (!passActual || !passNueva || !passConfirma) {
      setPassMsg({ type: "err", text: "Rellena todos los campos." });
      return;
    }
    if (passActual !== passwordGlobal) {
      setPassMsg({ type: "err", text: "La contraseña actual no es correcta." });
      return;
    }
    if (passNueva !== passConfirma) {
      setPassMsg({ type: "err", text: "La nueva contraseña y la confirmación no coinciden." });
      return;
    }
    setPasswordGlobal(passNueva);
    setPassActual("");
    setPassNueva("");
    setPassConfirma("");
    setPassMsg({ type: "ok", text: "Contraseña actualizada correctamente." });
  };

  const handleActualizarApi = (tipo: "kissoro" | "enplural") => {
    if (tipo === "kissoro" && apiKissoroNuevo) {
      setApiKissoroNuevo("");
      onCambioApis();
    }
    if (tipo === "enplural" && apiEnPluralNuevo) {
      setApiEnPluralNuevo("");
      onCambioApis();
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-lg space-y-6">
      {/* Contraseña */}
      <div>
        <h3 className="text-xl font-bold mb-4">Cambiar contraseña</h3>
        {passMsg && <p className={`mb-2 ${passMsg.type === "err" ? "text-red-600" : "text-green-600"}`}>{passMsg.text}</p>}
        <div className="flex flex-col md:flex-row md:space-x-4 space-y-2 md:space-y-0">
          <input type="password" placeholder="Contraseña actual" value={passActual} onChange={e=>setPassActual(e.target.value)} className="flex-1 rounded-lg border border-indigo-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <input type="password" placeholder="Nueva contraseña" value={passNueva} onChange={e=>setPassNueva(e.target.value)} className="flex-1 rounded-lg border border-indigo-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <input type="password" placeholder="Confirmar nueva contraseña" value={passConfirma} onChange={e=>setPassConfirma(e.target.value)} className="flex-1 rounded-lg border border-indigo-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <button onClick={handleCambioPassword} className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">Cambiar contraseña</button>
      </div>

      {/* APIs */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold mb-2">Configuración APIs</h3>
        {/* Kissoro */}
        <div className="flex space-x-4">
          <input type="text" value={apiKissoroVigente} readOnly className="flex-1 rounded-lg border border-gray-300 px-3 py-2 bg-gray-100" />
          <input type="text" value={apiKissoroNuevo} onChange={e=>setApiKissoroNuevo(e.target.value)} placeholder="Nueva API Kissoro" className="flex-1 rounded-lg border border-indigo-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>

        {/* En Plural */}
        <div className="flex space-x-4">
          <input type="text" value={apiEnPluralVigente} readOnly className="flex-1 rounded-lg border border-gray-300 px-3 py-2 bg-gray-100" />
          <input type="text" value={apiEnPluralNuevo} onChange={e=>setApiEnPluralNuevo(e.target.value)} placeholder="Nueva API En Plural" className="flex-1 rounded-lg border border-indigo-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <button onClick={()=>handleActualizarApi("kissoro")} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">Actualizar Kissoro</button>
        <button onClick={()=>handleActualizarApi("enplural")} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">Actualizar En Plural</button>
      </div>
    </div>
  );
}
