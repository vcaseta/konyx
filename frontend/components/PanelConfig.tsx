{/* APIs Kissoro y EnPlural: compactas en una sola fila */}
<div className="space-y-4">
  <div>
    <h4 className="text-md font-semibold text-indigo-700 mb-2">🔑 APIs externas</h4>

    {/* Kissoro */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center mb-2">
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
        onClick={async () => {
          if (!apiKissoroNuevo.trim()) return;
          const res = await fetch("http://192.168.1.51:8000/auth/update_apis", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ apiKissoro: apiKissoroNuevo }),
          });
          if (res.ok) {
            setApiKissoroVigente(apiKissoroNuevo);
            setApiKissoroNuevo("");
            alert("API Kissoro actualizada");
          }
        }}
        className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
      >
        Cambiar
      </button>
    </div>

    {/* En Plural */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center mb-2">
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
        onClick={async () => {
          if (!apiEnPluralNuevo.trim()) return;
          const res = await fetch("http://192.168.1.51:8000/auth/update_apis", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ apiEnPlural: apiEnPluralNuevo }),
          });
          if (res.ok) {
            setApiEnPluralVigente(apiEnPluralNuevo);
            setApiEnPluralNuevo("");
            alert("API En Plural actualizada");
          }
        }}
        className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
      >
        Cambiar
      </button>
    </div>

    {/* Groq: mantiene estilo largo */}
    <div className="mt-4">
      <label className="block text-sm font-medium text-gray-600 mb-1">API Groq (procesamiento IA)</label>
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
        onClick={async () => {
          if (!apiGroqNuevo.trim()) return;
          const res = await fetch("http://192.168.1.51:8000/auth/update_apis", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ apiGroq: apiGroqNuevo }),
          });
          if (res.ok) {
            setApiGroqVigente(apiGroqNuevo);
            setApiGroqNuevo("");
            alert("API Groq actualizada");
          }
        }}
        className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
      >
        Cambiar
      </button>
    </div>
  </div>
</div>
