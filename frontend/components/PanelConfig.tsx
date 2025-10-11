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
  setPassMsg: (val: { type: "ok" | "err"; text: string } | null) => void;

  passwordGlobal: string;
  setPasswordGlobal: (val: string) => void;

  apiKissoroVigente: string;
  apiKissoroNuevo: string;
  setApiKissoroNuevo: (val: string) => void;
  setApiKissoroVigente: (val: string) => void;

  apiEnPluralVigente: string;
  apiEnPluralNuevo: string;
  setApiEnPluralNuevo: (val: string) => void;
  setApiEnPluralVigente: (val: string) => void;

  apiGroqVigente: string;
  apiGroqNuevo: string;
  setApiGroqNuevo: (val: string) => void;
  setApiGroqVigente: (val: string) => void;
}

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.51:8000";

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
  setApiKissoroVigente,
  apiEnPluralVigente,
  apiEnPluralNuevo,
  setApiEnPluralNuevo,
  setApiEnPluralVigente,
  apiGroqVigente,
  apiGroqNuevo,
  setApiGroqNuevo,
  setApiGroqVigente,
}: PanelConfigProps) {
  const [loading, setLoading] = useState(false);

  // 🔐 CAMBIO DE CONTRASEÑA
  const actualizarPassword = async () => {
    if (!passActual || !passNueva || !passConfirma) {
      setPassMsg({ type: "err", text: "Debes completar todos los campos" });
      return;
    }
    if (passNueva !== passConfirma) {
      setPassMsg({ type: "err", text: "Las contraseñas nuevas no coinciden" });
      return;
    }
    if (passActual !== passwordGlobal) {
      setPassMsg({ type: "err", text: "La contraseña actual no es correcta" });
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${BACKEND}/auth/update_password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passNueva }),
      });
      if (!res.ok) throw new Error("Error actualizando contraseña");
      setPasswordGlobal(passNueva);
      sessionStorage.setItem("konyx_password", passNueva);
      setPassActual("");
      setPassNueva("");
      setPassConfirma("");
      setPassMsg({ type: "ok", text: "Contraseña actualizada correctamente ✅" });
    } catch (err) {
      console.error(err);
      setPassMsg({ type: "err", text: "Error actualizando contraseña" });
    } finally {
      setLoading(false);
    }
  };

  // 🌐 ACTUALIZAR CADA API
  const actualizarApi = async (nombre: "apiKissoro" | "apiEnPlural" | "apiGroq", valor: string) => {
    if (!valor.trim()) return alert("⚠️ Introduce una clave válida antes de guardar.");
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND}/auth/update_apis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [nombre]: valor }),
      });
      if (!res.ok) throw new Error("Error al actualizar API");

      if (nombre === "apiKissoro") {
        setApiKissoroVigente(valor);
        setApiKissoroNuevo("");
        localStorage.setItem("apiKissoro", valor);
      }
      if (nombre === "apiEnPlural") {
        setApiEnPluralVigente(valor);
        setApiEnPluralNuevo("");
        localStorage.setItem("apiEnPlural", valor);
      }
      if (nombre === "apiGroq") {
        setApiGroqVigente(valor);
        setApiGroqNuevo("");
        localStorage.setItem("apiGroq", valor);
      }

      alert(`✅ ${nombre} guardada correctamente`);
    } catch (err) {
      console.error(err);
      alert("❌ Error al actualizar API");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-lg space-y-6">
      <h3 className="text-xl font-bold text-indigo-800 mb-4">Configuración general</h3>

      {/* 🔐 CAMBIO DE CONTRASEÑA */}
      <div className="border-b pb-4 mb-4">
        <label className="block font-semibold text-gray-700 mb-3">Cambiar contraseña</label>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="password"
            value={passActual}
            onChange={(e) => setPassActual(e.target.value)}
            placeholder="Contraseña actual"
            className="rounded-lg border border-indigo-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="password"
            value={passNueva}
            onChange={(e) => setPassNueva(e.target.value)}
            placeholder="Nueva contraseña"
            className="rounded-lg border border-indigo-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="password"
            value={passConfirma}
            onChange={(e) => setPassConfirma(e.target.value)}
            placeholder="Confirmar nueva contraseña"
            className="rounded-lg border border-indigo-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <button
          onClick={actualizarPassword}
          disabled={loading}
          className="mt-3 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          {loading ? "Guardando..." : "Guardar contraseña"}
        </button>

        {passMsg && (
          <p className={`mt-2 text-sm ${passMsg.type === "ok" ? "text-green-600" : "text-red-600"}`}>
            {passMsg.text}
          </p>
        )}
      </div>

      {/* 🌐 API KISSORO */}
      <div>
        <label className="block font-semibold text-gray-700 mb-1">🔗 API Kissoro</label>
        <p className="text-sm text-gray-500 mb-2 truncate">
          Actual: {apiKissoroVigente || "—"}
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={apiKissoroNuevo}
            onChange={(e) => setApiKissoroNuevo(e.target.value)}
            placeholder="Nueva clave API Kissoro"
            className="flex-grow rounded-lg border border-indigo-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={() => actualizarApi("apiKissoro", apiKissoroNuevo)}
            disabled={loading}
            className="bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Guardar
          </button>
        </div>
      </div>

      {/* 🌐 API EN PLURAL */}
      <div>
        <label className="block font-semibold text-gray-700 mb-1">🔗 API En Plural Psicología</label>
        <p className="text-sm text-gray-500 mb-2 truncate">
          Actual: {apiEnPluralVigente || "—"}
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={apiEnPluralNuevo}
            onChange={(e) => setApiEnPluralNuevo(e.target.value)}
            placeholder="Nueva clave API En Plural"
            className="flex-grow rounded-lg border border-indigo-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={() => actualizarApi("apiEnPlural", apiEnPluralNuevo)}
            disabled={loading}
            className="bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Guardar
          </button>
        </div>
      </div>

      {/* 🌐 API GROQ */}
      <div>
        <label className="block font-semibold text-gray-700 mb-1">🔗 API Groq (IA de validación)</label>
        <p className="text-sm text-gray-500 mb-2 truncate">
          Actual: {apiGroqVigente || "—"}
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={apiGroqNuevo}
            onChange={(e) => setApiGroqNuevo(e.target.value)}
            placeholder="Nueva clave API Groq"
            className="flex-grow rounded-lg border border-indigo-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={() => actualizarApi("apiGroq", apiGroqNuevo)}
            disabled={loading}
            className="bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
