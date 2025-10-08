"use client";

interface PanelConfigProps {
  // Contraseña
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

  // APIs
  apiKissoroVigente: string;
  apiKissoroNuevo: string;
  setApiKissoroNuevo: (val: string) => void;
  apiKissoroMsg: { type: "ok" | "err"; text: string } | null;

  apiEnPluralVigente: string;
  apiEnPluralNuevo: string;
  setApiEnPluralNuevo: (val: string) => void;
  apiEnPluralMsg: { type: "ok" | "err"; text: string } | null;

  onCambioApis?: () => void;
}

export function PanelConfig({
  passActual,
  passNueva,
  passConfirma,
  setPassActual,
  setPassNueva,
  setPassConfirma,
  passMsg,
  setPassMsg,
  passwordGlobal,
  setPasswordGlobal,
  apiKissoroVigente,
  apiKissoroNuevo,
  setApiKissoroNuevo,
  apiKissoroMsg,
  apiEnPluralVigente,
  apiEnPluralNuevo,
  setApiEnPluralNuevo,
  apiEnPluralMsg,
  onCambioApis,
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
    sessionStorage.setItem("konyx_password", passNueva); // guarda permanentemente
    setPassActual("");
    setPassNueva("");
    setPassConfirma("");
    setPassMsg({ type: "ok", text: "Contraseña actualizada correctamente." });
  };

  const handleActualizarApi = (tipo: "kissoro" | "enplural") => {
    if (tipo === "kissoro") {
      if (!apiKissoroNuevo) return;
      localStorage.setItem("apiKissoro", apiKissoroNuevo);
      setApiKissoroNuevo("");
      if (onCambioApis) onCambioApis();
    }
    if (tipo === "enplural") {
      if (!apiEnPluralNuevo) return;
      localStorage.setItem("apiEnPlural", apiEnPluralNuevo);
      setApiEnPluralNuevo("");
      if (onCambioApis) onCambioApis();
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-lg space-y-6">

      {/* Contraseña */}
      <div>
        <h3 className="text-xl font-bold mb-4">Cambiar contraseña</h3>
        {passMsg && <p className={`mb-2 ${passMsg.type === "err" ? "text-red-600" : "text-green-600"}`}>{passMsg.text}</p>}
        <div className="flex flex-col md:flex-row md:space-x-4 space-y-2 md:space-y-0">
          <input
            type="password"
            placeholder="Contraseña actual"
            value={passActual}
            onChange={e => setPassActual(e.target.value)}
            className="flex-1 rounded-lg border border-indigo-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="password"
            placeholder="Nueva contraseña"
            value={passNueva}
            onChange={e => setPassNueva(e.target.value)}
            className="flex-1 rounded-lg border border-indigo-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="password"
            placeholder="Confirmar nueva contraseña"
            value={passConfirma}
            onChange={e => setPassConfirma(e.target.value)}
            className="flex-1 rounded-lg border border-indigo-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button
          onClick={handleCambioPassword}
          className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 shadow transition"
        >
          Cambiar contraseña
        </button>
      </div>

      {/* APIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Kissoro */}
        <div>
          <h3 className="text-xl font-bold mb-2">API Kissoro</h3>
          <input
            type="text"
            value={apiKissoroVigente}
            disabled
            className="w-full rounded-lg border border-gray-300 px-3 py-2 mb-2 bg-gray-100"
          />
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Nueva API Kissoro"
              value={apiKissoroNuevo}
              onChange={e => setApiKissoroNuevo(e.target.value)}
              className="flex-1 rounded-lg border border-indigo-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={() => handleActualizarApi("kissoro")}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 shadow transition"
            >
              Actualizar
            </button>
          </div>
          {apiKissoroMsg && <p className={`mt-1 ${apiKissoroMsg.type === "err" ? "text-red-600" : "text-green-600"}`}>{apiKissoroMsg.text}</p>}
        </div>

        {/* En Plural */}
        <div>
          <h3 className="text-xl font-bold mb-2">API En Plural</h3>
          <input
            type="text"
            value={apiEnPluralVigente}
            disabled
            className="w-full rounded-lg border border-gray-300 px-3 py-2 mb-2 bg-gray-100"
          />
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Nueva API En Plural"
              value={apiEnPluralNuevo}
              onChange={e => setApiEnPluralNuevo(e.target.value)}
              className="flex-1 rounded-lg border border-indigo-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={() => handleActualizarApi("enplural")}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 shadow transition"
            >
              Actualizar
            </button>
          </div>
          {apiEnPluralMsg && <p className={`mt-1 ${apiEnPluralMsg.type === "err" ? "text-red-600" : "text-green-600"}`}>{apiEnPluralMsg.text}</p>}
        </div>

      </div>
    </div>
  );
}

