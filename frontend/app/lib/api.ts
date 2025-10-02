// app/lib/api.ts
import axios from "axios";

export const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

type LoginResp = { token: string };

/**
 * Login contra /auth/login
 * OJO: el backend espera { user, password } (no "username").
 * Ya NO guardamos el token en localStorage para forzar login siempre.
 */
export async function apiLogin(user: string, password: string): Promise<string> {
  try {
    const { data, status } = await axios.post<LoginResp>(
      `${API_BASE}/auth/login`,
      { user, password },
      { headers: { "Content-Type": "application/json" } }
    );

    if (status !== 200 || !data?.token) {
      throw new Error("Credenciales inválidas");
    }

    // No persistimos token -> fuerza login cada vez
    return data.token;
  } catch (err: any) {
    const msg =
      err?.response?.data?.detail ||
      err?.message ||
      "No se pudo iniciar sesión";
    throw new Error(msg);
  }
}

/** Compat: que siempre “no haya sesión” */
export function getAuthToken(): string | null {
  return null; // nunca recordamos sesión
}

/** Compat: noop (no guardamos ni borramos nada) */
export function setAuthToken(_token: string | null) {
  // intencionalmente vacío
}
