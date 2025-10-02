// app/lib/api.ts
import axios from "axios";

export const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

type LoginResp = { token: string };

/**
 * Login contra /auth/login
 * OJO: el backend espera { user, password } (no "username").
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

    // Guarda token para posteriores sesiones
    if (typeof window !== "undefined") {
      localStorage.setItem("konyx_token", data.token);
    }

    return data.token;
  } catch (err: any) {
    const msg =
      err?.response?.data?.detail ||
      err?.message ||
      "No se pudo iniciar sesión";
    throw new Error(msg);
  }
}

/** Obtener token guardado (si existe) */
export function getSavedToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("konyx_token");
}

/** Alias para compatibilidad con código antiguo */
export const getAuthToken = getSavedToken;

/** Setter explícito para compatibilidad con código antiguo */
export function setAuthToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem("konyx_token", token);
  } else {
    localStorage.removeItem("konyx_token");
  }
}
