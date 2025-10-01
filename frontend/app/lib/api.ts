// frontend/app/lib/api.ts
const BASE = (process.env.NEXT_PUBLIC_BACKEND_URL || "").replace(/\/+$/, "");

/** Helpers de token en localStorage **/
const TOKEN_KEY = "konyx_token";

export function setAuthToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

/** Manejo de respuestas fetch **/
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

/** API calls **/
export async function login(username: string, password: string) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
    cache: "no-store",
  });
  return handle(res); // { token: "..." }
}

export async function getCompanies(token: string) {
  const res = await fetch(`${BASE}/companies`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  return handle(res);
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
