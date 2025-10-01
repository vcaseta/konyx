// frontend/app/lib/api.ts
const BASE = (process.env.NEXT_PUBLIC_BACKEND_URL || "").replace(/\/+$/, "");

async function handle(res: Response) {
  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { /* texto plano */ }
  if (!res.ok) {
    const msg = (data && (data.detail || data.message)) || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

export async function login(username: string, password: string) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
    // Importante en Next 13/14 app router para evitar caché:
    cache: "no-store",
  });
  return handle(res); // debería devolver { token: "..." }
}

export async function getCompanies(token: string) {
  const res = await fetch(`${BASE}/companies`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  return handle(res); // p.ej. [{id,name},...]
}

export async function getInvoices(token: string, q?: Record<string, string>) {
  const url = new URL(`${BASE}/invoices`);
  if (q) Object.entries(q).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  return handle(res);
}
