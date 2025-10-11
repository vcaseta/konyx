"use client";
import React from "react";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.51:8000";

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
  // 🔒 Cambiar contraseña (valida con backend)
  const handlePasswordChange = async () => {
    setPassMsg(null);

    if (!passActual || !passNueva || !passConfirma) {
      setPassMsg({ type: "err", text: "Completa todos los campos" });
      return;
    }

    try {
      const res = await fetch(`${BACKEND}/auth/update_password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          old_password: passActual,
          new_password: passNueva,
          confirm: passConfirma,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Error al cambiar la contraseña");
      }

      const data = await res.json();
      setPassMsg({ type: "ok", text: data.message });
      setPasswordGlobal(data.password);
      sessionStorage.setItem("konyx_password", data.password);
      setPassActual("");
      setPassNueva("");
      setPassConfirma("");
    } catch (err: any) {
      setPassMsg({ type: "err", text: err.message || "Error inesperado" });
    }
  };

  // ⚙️ Cambiar APIs y guardar en backend
  const handleApiChange = async (
    tipo: "kissoro" | "enplural" | "groq",
    nueva: string
  ) => {
    setPassMsg(null);
    if (!nueva.trim()) {
      setPassMsg({ type: "err", text: "Introduce una API válida" });
      return;
    }

    try {
      const body: any = {};
      if (tipo === "kissoro") body.apiKissoro = nueva;
      if (tipo === "enplural") body.apiEnPlural = nueva;
      if (tipo === "groq") body.apiGroq = nueva;

      const res = await fetch(`${BACKEND}/auth/update_apis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Error al actualizar API");
      }

      const data = await res.json();
      setPassMsg({ type: "ok", text: "API actualizada correctamente" });

      if (tipo === "kissoro") {
        setApiKissoroVigente(data.apiKissoro || nueva);
        localStorage.setItem("apiKissoro", data.apiKissoro || nueva);
      }
      if (tipo === "enplural") {
        setApiEnPluralVigente(data.apiEnPlural || nueva);
        localStorage.setItem("apiEnPlural", data.apiEnPlural || nueva);
      }
      if (tipo === "groq") {
        setApiGroqVigente(data.apiGroq || nueva);
        localStorage.setItem("apiGroq", data.apiGroq || nueva);
      }
    } catch (err: any) {
      setPassMsg({ type: "err", text: err.message || "Error inesperado" });
    }
  };

  return (
    <div className="bg-white/80 rounded-2xl shadow-lg p-6 backdrop-blur-sm space-y-6">
      <h3 className="text-xl font-bold text-indigo-700 text-center mb-2">
        Configuración del sistema
      </h3>

      {/* Mensaje de estado */}
      {passMsg && (
        <p
          className={`text-center font-semibold ${
            passMsg.type === "ok" ? "text-green-600" : "text-red-600"
          }`}
        >
          {passMsg.text}
        </p>
      )}

      {/* ---- CONTRASEÑA ---- */}
      <div className="flex flex-col sm:flex-row items-center gap-2 border-b border-indigo-100 pb-4">
        <label className="text-gray-700 font-medium w-32">Contraseña:</label>
        <input
          type="password"
          placeholder="Actual"
          value={passActual}
          onChange={(e) => setPassActual(e.target.value)}
          className="flex-1 rounded-lg border border-gray-300 px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="password"
          placeholder="Nueva"
          value={passNueva}
          onChange={(e) => setPassNueva(e.target.value)}
          className="flex-1 rounded-lg border border-gray-300 px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="password"
          placeholder="Confirmar"
          value={passConfirma}
          onChange={(e) => setPassConfirma(e.target.value)}
          className="flex-1 rounded-lg border border-gray-300 px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={handlePasswordChange}
          className="text-sm bg-indigo-700 text-white font-semibold px-4 py-1 rounded-lg 
                     hover:bg-indigo-800 hover:scale-105 hover:shadow-md 
                     transition-all duration-200 ease-in-out whitespace-nowrap"
        >
          Cambiar
        </button>
      </div>

      {/* ---- API KISSORO ---- */}
      <div className="flex flex-col sm:flex-row items-center gap-2 border-b border-indigo-100 pb-4">
        <label className="text-gray-700 font-medium w-32">API Kissoro:</label>
        <input
          type="text"
          placeholder="Actual"
          value={apiKissoroVigente}
          readOnly
          className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1 text-gray-500"
        />
        <input
          type="text"
          placeholder="Nueva API"
          value={apiKissoroNuevo}
          onChange={(e) => setApiKissoroNuevo(e.target.value)}
          className="flex-1 rounded-lg border border-gray-300 px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={() => handleApiChange("kissoro", apiKissoroNuevo)}
          className="text-sm bg-indigo-700 text-white font-semibold px-4 py-1 rounded-lg 
                     hover:bg-indigo-800 hover:scale-105 hover:shadow-md 
                     transition-all duration-200 ease-in-out whitespace-nowrap"
        >
          Cambiar
        </button>
      </div>

      {/* ---- API EN PLURAL ---- */}
      <div className="flex flex-col sm:flex-row items-center gap-2 border-b border-indigo-100 pb-4">
        <label className="text-gray-700 font-medium w-32">API En Plural:</label>
        <input
          type="text"
          placeholder="Actual"
          value={apiEnPluralVigente}
          readOnly
          className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1 text-gray-500"
        />
        <input
          type="text"
          placeholder="Nueva API"
          value={apiEnPluralNuevo}
          onChange={(e) => setApiEnPluralNuevo(e.target.value)}
          className="flex-1 rounded-lg border border-gray-300 px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={() => handleApiChange("enplural", apiEnPluralNuevo)}
          className="text-sm bg-indigo-700 text-white font-semibold px-4 py-1 rounded-lg 
                     hover:bg-indigo-800 hover:scale-105 hover:shadow-md 
                     transition-all duration-200 ease-in-out whitespace-nowrap"
        >
          Cambiar
        </button>
      </div>

      {/* ---- API GROQ ---- */}
      <div className="flex flex-col sm:flex-row items-center gap-2">
        <label className="text-gray-700 font-medium w-32">API Groq:</label>
        <input
          type="text"
          placeholder="Actual"
          value={apiGroqVigente}
          readOnly
          className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1 text-gray-500"
        />
        <input
          type="text"
          placeholder="Nueva API"
          value={apiGroqNuevo}
          onChange={(e) => setApiGroqNuevo(e.target.value)}
          className="flex-1 rounded-lg border border-gray-300 px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={() => handleApiChange("groq", apiGroqNuevo)}
          className="text-sm bg-indigo-700 text-white font-semibold px-4 py-1 rounded-lg 
                     hover:bg-indigo-800 hover:scale-105 hover:shadow-md 
                     transition-all duration-200 ease-in-out whitespace-nowrap"
        >
          Cambiar
        </button>
      </div>
    </div>
  );
};
