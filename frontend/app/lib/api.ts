export const API_BASE = (process.env.NEXT_PUBLIC_BACKEND_URL || "").replace(/\/+$/, "");

/**
 * Login en la API backend
 */
export async function apiLogin(username: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user: username, password }), // OJO: backend espera "user"
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.detail || `Login fallo (${res.status})`);
  }

  if (!data?.token) {
    throw new Error("Login sin token en la respuesta");
  }

  return data.token as string;
}
