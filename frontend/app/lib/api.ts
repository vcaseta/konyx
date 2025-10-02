// app/lib/api.ts
import axios from "axios";

export const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

type LoginResp = { token: string };

/**
 * Login contra /auth/login
 * Lanza Error si credenciales no válidas o si el backend responde != 200.
 */
export async function apiLogin(user: string, password: string): Promise<string> {
  try {
    const { data, status } = await axios.post<LoginResp>(
      `${API_BASE}/auth/login`,
      { user, password }, // <-- OJO: tu backend espera "user" y "password"
      { headers: { "Content-Type": "application/json" } }
    );

    if (status !== 200 || !data?.token) {
      throw new Error("Credenciales inválidas");
    }

    // Guarda token para sesiones siguientes:
    if (typeof window !== "undefined") {
      localStorage.setItem("konyx_token", data.token);
    }
    return data.token;
  } catch (err: any) {
    // Normaliza mensaje
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
