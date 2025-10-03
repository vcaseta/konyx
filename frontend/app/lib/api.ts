// app/lib/api.ts
export const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL || "";

export async function apiLogin(user: string, password: string): Promise<string> {
  if (!API_BASE) {
    throw new Error("API no configurada (NEXT_PUBLIC_BACKEND_URL)");
  }

  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user, password }),
  });

  // Intenta parsear JSON siempre (aunque no sea 2xx) para extraer mensajes
  let data: any = {};
  try {
    data = await res.json();
  } catch (_) {
    // si no es JSON, dejamos data={}
  }

  if (!res.ok) {
    const msg = typeof data?.detail === "string" ? data.detail : "Credenciales inválidas";
    throw new Error(msg);
  }

  const token = data?.token;
  if (!token) {
    throw new Error("Respuesta inválida del servidor (sin token)");
  }
  return token;
}
