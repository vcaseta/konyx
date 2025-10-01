"use client";
import { useEffect, useState } from "react";
import api, { setCompany, getCompany } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

type Company = { id: string; name: string };
type Invoice = { id: string; number: string; total: number };

export default function Dashboard() {
  const { logout } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyId, setCompanyId] = useState<string | null>(getCompany());
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);

  // Cargar empresas configuradas (del backend)
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get<Company[]>("/companies");
        setCompanies(data);
        if (!companyId && data.length) {
          setCompany(data[0].id);
          setCompanyId(data[0].id);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  // Cargar facturas cuando cambia empresa
  useEffect(() => {
    if (!companyId) return;
    setLoading(true);
    api.get<Invoice[]>("/invoices") // el interceptor ya mete X-Company
      .then(({ data }) => setInvoices(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [companyId]);

  const onPickCompany = (id: string) => {
    setCompany(id);
    setCompanyId(id);
  };

  return (
    <main className="min-h-screen p-6">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Konyx" className="h-10 w-auto" />
          <h1 className="text-xl font-semibold">Konyx</h1>
        </div>
        <button onClick={logout} className="px-4 py-2 rounded-lg bg-gray-900 text-white">Salir</button>
      </header>

      <section className="bg-white/90 rounded-2xl p-6 shadow">
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <label className="text-sm font-medium">Empresa</label>
          <select
            value={companyId ?? ""}
            onChange={(e) => onPickCompany(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <h2 className="text-lg font-semibold mb-3">Últimas facturas</h2>
        {loading ? (
          <p>Cargando…</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {invoices.map(inv => (
              <div key={inv.id} className="rounded-xl border p-4 bg-white">
                <div className="font-medium">#{inv.number}</div>
                <div className="text-sm text-gray-600">Total: {inv.total.toFixed(2)} €</div>
              </div>
            ))}
            {!invoices.length && <p className="text-gray-600">No hay facturas.</p>}
          </div>
        )}
      </section>
    </main>
  );
}
