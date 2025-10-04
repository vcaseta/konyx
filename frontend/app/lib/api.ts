// app/lib/api.ts
export const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "";

export async function apiLogin(username: string, password: string): Promise<string> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({ user: username, password }),
  });

  let data: any = {};
  try {
    data = await res.json();
  } catch {
    throw new Error("Respuesta del servidor inválida");
  }

  if (!res.ok) {
    const msg = (data?.detail?.[0]?.msg) || data?.detail || "Credenciales inválidas";
    throw new Error(msg);
  }

  const token =
    data?.token ||
    data?.access_token ||
    data?.Token ||
    (typeof data === "string" ? data : null);

  if (!token || typeof token !== "string") {
    throw new Error("Token de acceso no válido");
  }

  return token;
}
