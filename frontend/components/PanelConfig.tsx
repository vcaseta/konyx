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

  // APIs...
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
  // APIs...
}: PanelConfigProps) {

  const handleCambioPassword = () => {
    setPassMsg(null);

    // Validaciones
    if (!passActual || !passNueva || !passConfirma) {
      setPassMsg({ type: "err", text: "Rellena todos los campos." });
      return;
    }

    // Comparar contraseña actual con la permanente
    if (passActual !== passwordGlobal) {
      setPassMsg({ type: "err", text: "La contraseña actual no es correcta." });
      return;
    }

    // Validar nueva contraseña
    if (passNueva !== passConfirma) {
      setPassMsg({ type: "err", text: "La nueva contraseña y la confirmación no coinciden." });
      return;
    }

    // Guardar nueva contraseña en la variable permanente y sessionStorage
    setPasswordGlobal(passNueva);
    sessionStorage.setItem("konyx_password", passNueva);

    // Limpiar campos
    setPassActual("");
    setPassNueva("");
    setPassConfirma("");
    setPassMsg({ type: "ok", text: "Contraseña actualizada correctamente." });
  };

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-lg space-y-6">

      {/* Cambiar contraseña */}
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

      {/* Secciones de APIs seguirían aquí */}
    </div>
  );
}
