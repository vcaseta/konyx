// frontend/app/lib/api.ts
export const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/+$/, "") || "";

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("konyx_token");
}

export function setAuthToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem("konyx_token", token);
  } else {
    localStorage.removeItem("konyx_token");
  }
}

export async function login(user: string, password: string): Promise<string> {
  // El backend espera { user, password } (no "username")
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // Importante: usar "user" como clave
    body: JSON.stringify({ user, password }),
    cache: "no-store",
  });

  if (!res.ok) {
    let msg = "Error de autenticación";
    try {
      const j = await res.json();
      msg = j?.detail || msg;
    } catch {}
    throw new Error(msg);
  }

  const data = await res.json();
  // El backend devuelve { token: "..." }
  const token: string = data?.token;
  if (!token) throw new Error("Respuesta de login inválida");
  setAuthToken(token);
  return token;
}

export async function fetchWithAuth(
  path: string,
  init?: RequestInit
): Promise<Response> {
  const token = getAuthToken();
  const headers = new Headers(init?.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetch(`${API_BASE}${path}`, { ...init, headers });
}
