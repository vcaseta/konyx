"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Logo from "./components/Logo";
import Login from "./components/Login";

type Company = {
  key: string;
  label: string;
  baseUrl: string; // URL del backend para esa empresa
};

export default function Page() {
  // Token y empresa seleccionada (para multiempresa)
  const [token, setToken] = useState<string | null>(null);
  const [companyKey, setCompanyKey] = useState<string | null>(null);

  // Empresas (puedes editarlas luego en UI o leerlas de backend)
  const companies: Company[] = useMemo(
    () => [
      { key: "empresaA", label: "Empresa A", baseUrl: "http://192.168.1.51:8000" },
      { key: "empresaB", label: "Empresa B", baseUrl: "http://192.168.1.51:8001" }
    ],
    []
  );

  const selectedCompany = useMemo(
    () => companies.find((c) => c.key === companyKey) ?? companies[0],
    [companies, companyKey]
  );

  // Simulación login (sustituir por llamada real a backend)
  const handleLogin = async (user: string, pass: string) => {
    // Aquí harías: const { data } = await axios.post(`${selectedCompany.baseUrl}/auth/login`, { user, pass })
    const fakeToken = btoa(`${user}:${pass}:${Date.now()}`);
    setToken(fakeToken);
    localStorage.setItem("konyx_token", fakeToken);
  };

  useEffect(() => {
    const t = localStorage.getItem("konyx_token");
    if (t) setToken(t);
  }, []);

  // Ejemplo de llamada al backend (ping) cuando ya hay token
  const testPing = async () => {
    try {
      const { data } = await axios.get(`${selectedCompany.baseUrl}/ping`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`Backend (${selectedCompany.label}) OK: ${JSON.stringify(data)}`);
    } catch (e: any) {
      alert(`Error llamando backend ${selectedCompany.label}: ${e?.message || e}`);
    }
  };

  return (
    <main className="max-w-6xl mx-auto p-6">
      {/* Cabecera */}
      <header className="flex items-center justify-between mb-6">
        <Logo />
        <div className="flex items-center gap-3">
          <select
            className="bg-white/10 border border-white/10 rounded-xl px-3 py-2"
            value={selectedCompany.key}
            onChange={(e) => setCompanyKey(e.target.value)}
          >
            {companies.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>

          {token ? (
            <button
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl"
              onClick={() => {
                setToken(null);
                localStorage.removeItem("konyx_token");
              }}
            >
              Cerrar sesión
            </button>
          ) : null}
        </div>
      </header>

      {/* Contenido */}
      {!token ? (
        <div className="flex justify-center">
          <Login onSubmit={handleLogin} />
        </div>
      ) : (
        <section className="bg-white rounded-2xl p-6 shadow text-black">
          <h2 className="text-lg font-semibold mb-2">Konyx</h2>
          <p className="text-sm text-gray-600 mb-6">
            Selecciona empresa y prueba conexión al backend.
          </p>
          <div className="flex items-center gap-3">
            <button
              className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl"
              onClick={testPing}
            >
              Probar backend ({selectedCompany.label})
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
