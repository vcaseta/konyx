"use client";
import React, { useState } from "react";

interface PanelConfigProps {
  passActual: string;
  passNueva: string;
  passConfirma: string;
  setPassActual: (v: string) => void;
  setPassNueva: (v: string) => void;
  setPassConfirma: (v: string) => void;
  passMsg: { type: "ok" | "err"; text: string } | null;
  setPassMsg: (v: { type: "ok" | "err"; text: string } | null) => void;
  passwordGlobal: string;
  setPasswordGlobal: (v: string) => void;
  apiKissoroVigente: string;
  apiKissoroNuevo: string;
  setApiKissoroNuevo: (v: string) => void;
  setApiKissoroVigente: (v: string) => void;
  apiEnPluralVigente: string;
  apiEnPluralNuevo: string;
  setApiEnPluralNuevo: (v: string) => void;
  setApiEnPluralVigente: (v: string) => void;
  apiGroqVigente: string;
  apiGroqNuevo: string;
  setApiGroqNuevo: (v: string) => void;
  setApiGroqVigente: (v: string) => void;
}

const BACKEND = "http://192.168.1.51:8000";

export const PanelConfig: React.FC<PanelConfigProps> = ({
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
  setApiKissoroVigente,
  apiEnPluralVigente,
  apiEnPluralNuevo,
  setApiEnPluralNuevo,
  setApiEnPluralVigente,
  apiGroqVigente,
  apiGroqNuevo,
  setApiGroqNuevo,
  setApiGroqVigente,
}) => {
  const [saving, setSaving] = useState(false);

  // Cambiar contraseña global
  const handlePasswordChange = async () => {
    setPassMsg(null);
    if (!passActual || !passNueva || !passConfirma)
      return setPassMsg({ type: "err", text: "Completa todos los campos." });

    if (passActual !== passwordGlobal)
      return setPassMsg({ type: "err", text: "Contraseña actual incorrecta." });

    if (passNueva !== passConfirma)
      return setPassMsg({ type: "err", text: "Las contraseñas no coinciden." });

    setSaving(true);
    try {
      const res = await fetch(`${BACKEND}/auth/update_password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passNueva }),
      });

      if (!res.ok) throw new Error("Error al actualizar contraseña");

      const data = await res.json();
      setPasswordGlobal(data.password);
      sessionStorage.setItem("konyx_password", data.password);
      setPassMsg({ type: "ok", text: "Contraseña actualizada correctamente." });
      setPassActual("");
      setPassNueva("");
      setPassConfirma("");
    } catch {
      setPassMsg({ type: "err", text: "Error al actualizar la contraseña." });
    } finally {
      setSaving(false);
    }
  };

  // Cambiar una API específica
  const handleApiUpdate = async (field: "apiKissoro" | "apiEnPlural" | "apiGroq", value: string) => {
    if (!value.trim()) return alert("Introduce un valor válido antes de guardar.");
    try {
      const res = await fetch(`${BACKEND}/auth/update_apis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      if (!res.ok) throw new Error("Error al actualizar API");
      const data = await res.json();

      if (field === "apiKissoro") {
        setApiKissoroVigente(data.apiKissoro);
        setApiKissoroNuevo("");
      }
      if (field === "apiEnPlural") {
        setApiEnPluralVigente(data.apiEnPlural);
        setApiEnPluralNuevo("");
      }
      if (field === "apiGroq") {
        setApiGroqVigente(data.apiGroq);
        setApiGroqNuevo("");
      }

      alert(`✅ ${field} actualizada correctamente.`);
    } catch {
      alert("❌ Error al actualizar API.");
    }
  };

  return (
    <div className="bg-white/80 rounded-2xl shadow-lg p-6 space-y-6 backdrop-blur-sm">
      <h3 className="text-xl font-bold text-indigo-700 text-center mb-2">⚙️ Configuración del sistema</h3>

      {/* Cambiar contraseña */}
      <div className="space-y-3">
        <h4 className="text-md font-semibold text-indigo-700 mb-2">🔐 Cambiar contraseña</h4>
        <input
          type="password"
          placeholder="Contraseña actual"
          value={passActual}
          onChange={(e) => setPassActual(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
        <input
          type="password"
          placeholder="Nueva contraseña"
          value={passNueva}
          onChange={(e) => setPassNueva(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
        <input
          type="password"
          placeholder="Confirmar nueva contraseña"
          value={passConfirma}
          onChange={(e) => setPassConfirma(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
        <button
          onClick={handlePasswordChange}
          disabled={saving}
          className={`w-full py-2 rounded-lg text-white font-semibold transition ${
            saving ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {saving ? "Guardando..." : "Guardar contraseña"}
        </button>
        {passMsg && (
          <p
            className={`text-center text-sm ${
              passMsg.type === "ok" ? "text-green-600" : "text-red-600"
            }`}
          >
            {passMsg.text}
          </p>
        )}
      </div>

      {/* APIs compactas */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold text-indigo-700 mb-2">🔑 APIs externas</h4>

        {/* Kissoro */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
          <input
            type="text"
            value={apiKissoroVigente}
            readOnly
            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-600 text-sm"
            placeholder="API actual Kissoro"
          />
          <input
            type="text"
            value={apiKissoroNuevo}
            onChange={(e) => setApiKissoroNuevo(e.target.value)}
            placeholder="Nueva API Kissoro"
            className="w-full border border-indigo-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={() => handleApiUpdate("apiKissoro", apiKissoroNuevo)}
            className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
          >
            Cambiar
          </button>
        </div>

        {/* En Plural */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
          <input
            type="text"
            value={apiEnPluralVigente}
            readOnly
            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-600 text-sm"
            placeholder="API actual En Plural"
          />
          <input
            type="text"
            value={apiEnPluralNuevo}
            onChange={(e) => setApiEnPluralNuevo(e.target.value)}
            placeholder="Nueva API En Plural"
            className="w-full border border-indigo-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={() => handleApiUpdate("apiEnPlural", apiEnPluralNuevo)}
            className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
          >
            Cambiar
          </button>
        </div>

        {/* Groq (más larga) */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            🧠 API Groq (procesamiento IA)
          </label>
          <input
            type="text"
            value={apiGroqVigente}
            readOnly
            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-600 text-sm mb-2"
            placeholder="API actual Groq"
          />
          <input
            type="text"
            value={apiGroqNuevo}
            onChange={(e) => setApiGroqNuevo(e.target.value)}
            placeholder="Nueva API Groq"
            className="w-full border border-indigo-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 mb-2"
          />
          <button
            onClick={() => handleApiUpdate("apiGroq", apiGroqNuevo)}
            className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
          >
            Cambiar
          </button>
        </div>
      </div>
    </div>
  );
};
