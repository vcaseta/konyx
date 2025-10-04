export const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "";

export async function apiLogin(username: string, password: string): Promise<string> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({ user: username, password }),
  });

  if (!res.ok) {
    let msg = "Credenciales inválidas";
    try {
      const data = await res.json();
      msg = (data?.detail?.[0]?.msg) || data?.detail || msg;
    } catch {}
    throw new Error(msg);
  }

  const data = await res.json();
  const token =
    data?.token ||
    data?.access_token ||
    data?.Token ||
    (typeof data === "string" ? data : null);

  if (!token) throw new Error("Respuesta de login inválida");
  return token;
}

