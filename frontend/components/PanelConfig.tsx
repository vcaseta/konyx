"use client";

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
  const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.51:8000";

  // 🔐 Cambiar contraseña
  const handlePasswordUpdate = async () => {
    if (passNueva !== passConfirma) {
      setPassMsg({ type: "err", text: "Las contraseñas no coinciden." });
      return;
    }

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
    } catch (err) {
      console.error(err);
      setPassMsg({ type: "err", text: "Error al actualizar la contraseña." });
    }
  };

  // 🧩 Guardar APIs individualmente
  const handleSaveApi = async (campo: string, valor: string) => {
    try {
      const res = await fetch(`${BACKEND}/auth/update_apis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [campo]: valor }),
      });

      if (!res.ok) throw new Error("Error al actualizar API");
      const data = await res.json();

      if (campo === "apiKissoro") {
        setApiKissoroVigente(data.apiKissoro);
        localStorage.setItem("apiKissoro", data.apiKissoro);
        setApiKissoroNuevo("");
      }
      if (campo === "apiEnPlural") {
        setApiEnPluralVigente(data.apiEnPlural);
        localStorage.setItem("apiEnPlural", data.apiEnPlural);
        setApiEnPluralNuevo("");
      }
      if (campo === "apiGroq") {
        setApiGroqVigente(data.apiGroq);
        localStorage.setItem("apiGroq", data.apiGroq);
        setApiGroqNuevo("");
      }
    } catch (err) {
      console.error(err);
      alert("Error al actualizar la API.");
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-lg space-y-8">
      <h3 className="text-2xl font-bold text-indigo-800 mb-4">⚙️ Configuración general</h3>

      {/* Sección contraseña */}
      <div>
        <h4 className="text-lg font-semibold text-gray-700 mb-3">Contraseña</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="password"
            placeholder="Contraseña actual"
            value={passActual}
            onChange={(e) => setPassActual(e.target.value)}
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400"
          />
          <input
            type="password"
            placeholder="Nueva contraseña"
            value={passNueva}
            onChange={(e) => setPassNueva(e.target.value)}
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400"
          />
          <input
            type="password"
            placeholder="Confirmar contraseña"
            value={passConfirma}
            onChange={(e) => setPassConfirma(e.target.value)}
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400"
          />
        </div>
        <button
          onClick={handlePasswordUpdate}
          className="mt-3 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          Actualizar contraseña
        </button>
        {passMsg && (
          <p
            className={`mt-2 font-medium ${
              passMsg.type === "ok" ? "text-green-600" : "text-red-600"
            }`}
          >
            {passMsg.text}
          </p>
        )}
      </div>

      {/* Sección APIs */}
      <div>
        <h4 className="text-lg font-semibold text-gray-700 mb-3">APIs configuradas</h4>
        <div className="space-y-4">

          {/* 🔑 API Kissoro */}
          <div className="flex flex-col md:flex-row md:items-center md:space-x-3">
            <div className="flex-1">
              <label className="font-semibold text-gray-600">🔑 API Kissoro</label>
              <input
                type="text"
                placeholder="Nueva clave API Kissoro"
                value={apiKissoroNuevo}
                onChange={(e) => setApiKissoroNuevo(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-indigo-400"
              />
              <p className="text-xs text-gray-500 mt-1">Actual: {apiKissoroVigente || "—"}</p>
            </div>
            <button
              onClick={() => handleSaveApi("apiKissoro", apiKissoroNuevo || apiKissoroVigente)}
              className="mt-3 md:mt-6 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              Guardar
            </button>
          </div>

          {/* 🔑 API En Plural */}
          <div className="flex flex-col md:flex-row md:items-center md:space-x-3">
            <div className="flex-1">
              <label className="font-semibold text-gray-600">🔑 API En Plural Psicología</label>
              <input
                type="text"
                placeholder="Nueva clave API En Plural"
                value={apiEnPluralNuevo}
                onChange={(e) => setApiEnPluralNuevo(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-indigo-400"
              />
              <p className="text-xs text-gray-500 mt-1">Actual: {apiEnPluralVigente || "—"}</p>
            </div>
            <button
              onClick={() => handleSaveApi("apiEnPlural", apiEnPluralNuevo || apiEnPluralVigente)}
              className="mt-3 md:mt-6 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              Guardar
            </button>
          </div>

          {/* 🧠 API Groq */}
          <div className="flex flex-col md:flex-row md:items-center md:space-x-3">
            <div className="flex-1">
              <label className="font-semibold text-gray-600">🧠 API Groq (ChatGPT)</label>
              <input
                type="text"
                placeholder="Nueva clave API Groq"
                value={apiGroqNuevo}
                onChange={(e) => setApiGroqNuevo(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-indigo-400"
              />
              <p className="text-xs text-gray-500 mt-1">Actual: {apiGroqVigente || "—"}</p>
            </div>
            <button
              onClick={() => handleSaveApi("apiGroq", apiGroqNuevo || apiGroqVigente)}
              className="mt-3 md:mt-6 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
