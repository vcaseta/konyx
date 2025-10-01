// app/lib/api.ts
export const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "";

// Helpers de token por si otros componentes los usan
export function setAuthToken(t: string) {
  if (typeof window !== "undefined") localStorage.setItem("konyx_token", t);
}
export function getAuthToken(): string | null {
  if (typeof window !== "undefined") return localStorage.getItem("konyx_token");
  return null;
}

// Login contra el backend (FastAPI espera {user, password})
export async function login(username: string, password: string): Promise<string> {
  if (!API_BASE) throw new Error("API base no configurada (NEXT_PUBLIC_BACKEND_URL)");
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user: username, password }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Login fallido (${res.status}): ${txt}`);
  }

  const data = await res.json();
  const token: string = data?.token || data?.access_token || "";
  if (!token) throw new Error("Respuesta sin token");

  setAuthToken(token);
  return token;
}

// Alias para mantener compatibilidad con Login.tsx
export { login as apiLogin };
