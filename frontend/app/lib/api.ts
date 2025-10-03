// app/lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "";

export async function apiLogin(username: string, password: string): Promise<string> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user: username, password }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Login failed (${res.status})`);
  }
  const data = await res.json();
  // Ajusta a tu backend: por lo que vimos devuelve { token: "..." }
  if (!data?.token) throw new Error("Respuesta inválida del servidor");
  return data.token as string;
}
