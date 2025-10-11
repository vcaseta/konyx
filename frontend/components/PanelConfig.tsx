"use client";

interface PanelConfigProps {
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
  // -----------------------------
  // 🔐 Cambiar contraseña global
  // -----------------------------
  const actualizarPassword = async () => {
    try {
      const res = await fetch(`${BACKEND}/auth/update_password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordGlobal }),
      });
      if (!res.ok) throw new Error("Error al actualizar contraseña");
      alert("Contraseña actualizada correctamente ✅");
    } catch (err) {
      console.error(err);
      alert("❌ Error actualizando contraseña");
    }
  };

  // -----------------------------
  // 🌐 Actualizar cada API
  // -----------------------------
  const actualizarApi = async (nombre: "apiKissoro" | "apiEnPlural" | "apiGroq", valor: string) => {
    try {
      const res = await fetch(`${BACKEND}/auth/update_apis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [nombre]: valor }),
      });
      if (!res.ok) throw new Error("Error actualizando API");
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
    }
  };

  // -----------------------------
  // 🧩 Render
  // -----------------------------
  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-lg">
      <h3 className="text-xl font-bold mb-4 text-indigo-800">Configuración general</h3>

      {/* CONTRASEÑA */}
      <div className="mb-6">
        <label className="block font-semibold text-gray-700 mb-2">🔐 Contraseña global</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={passwordGlobal}
            onChange={(e) => setPasswordGlobal(e.target.value)}
            className="flex-grow rounded-lg border border-indigo-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={actualizarPassword}
            className="bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Guardar
          </button>
        </div>
      </div>

      {/* API KISSORO */}
      <div className="mb-6">
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
            className="flex-grow rounded-lg border border-indigo-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={() => actualizarApi("apiKissoro", apiKissoroNuevo)}
            className="bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Guardar
          </button>
        </div>
      </div>

      {/* API EN PLURAL */}
      <div className="mb-6">
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
            className="flex-grow rounded-lg border border-indigo-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={() => actualizarApi("apiEnPlural", apiEnPluralNuevo)}
            className="bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Guardar
          </button>
        </div>
      </div>

      {/* API GROQ */}
      <div>
        <label className="block font-semibold text-gray-700 mb-1">🔗 API Groq (validación IA)</label>
        <p className="text-sm text-gray-500 mb-2 truncate">
          Actual: {apiGroqVigente || "—"}
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={apiGroqNuevo}
            onChange={(e) => setApiGroqNuevo(e.target.value)}
            placeholder="Nueva clave API Groq"
            className="flex-grow rounded-lg border border-indigo-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={() => actualizarApi("apiGroq", apiGroqNuevo)}
            className="bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
