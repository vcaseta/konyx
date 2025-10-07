"use client";

import { useState } from "react";

interface PanelConfigProps {
  passActual: string;
  passNueva: string;
  passConfirma: string;
  setPassActual: (val: string) => void;
  setPassNueva: (val: string) => void;
  setPassConfirma: (val: string) => void;
  passMsg: { type: "ok" | "err"; text: string } | null;
  setPassMsg: (msg: { type: "ok" | "err"; text: string } | null) => void;
  passwordGlobal: string; // variable que almacena la contraseña real
  setPasswordGlobal: (val: string) => void;

  // APIs (opcional)
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

    // Todo correcto, actualizar contraseña
    setPasswordGlobal(passNueva);
    setPassActual("");
    setPassNueva("");
    setPassConfirma("");
    setPassMsg({ type: "ok", text: "Contraseña actualizada correctamente." });
  };

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-lg space-y-6">
      <div>
        <h3 className="text-xl font-bold mb-4">Cambiar contraseña</h3>
        {passMsg && <p className={`mb-2 ${passMsg.type === "err" ? "text-red-600" : "text-green-600"}`}>{passMsg.text}</p>}
        <input
          type="password"
          placeholder="Contraseña actual"
          value={passActual}
          onChange={e => setPassActual(e.target.value)}
          className="w-full rounded-lg border border-indigo-300 px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="password"
          placeholder="Nueva contraseña"
          value={passNueva}
          onChange={e => setPassNueva(e.target.value)}
          className="w-full rounded-lg border border-indigo-300 px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="password"
          placeholder="Confirmar nueva contraseña"
          value={passConfirma}
          onChange={e => setPassConfirma(e.target.value)}
          className="w-full rounded-lg border border-indigo-300 px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={handleCambioPassword}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 shadow transition"
        >
          Cambiar contraseña
        </button>
      </div>
      {/* Resto de configuración de APIs aquí */}
    </div>
  );
}

