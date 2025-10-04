// app/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Login from "./components/Login";

export default function Page() {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);

  async function handleOk(token: string) {
    try {
      // Siempre obligamos sesión nueva: en sessionStorage, nunca en localStorage
      sessionStorage.setItem("token", token);
      // Pediste resetear selecciones en cada inicio de sesión
      sessionStorage.setItem("reset-dashboard-state", "1");
      router.push("/dashboard");
    } catch (e: any) {
      setErr(e?.message ?? "No se pudo iniciar sesión");
    }
  }

  return (
    <main
      className="min-h-screen bg-no-repeat bg-center bg-cover flex items-center justify-center p-4"
      style={{
        backgroundImage: "url(/fondo.png)",
        backgroundSize: "100% 100%",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <img src="/logo.png" alt="Konyx" className="h-24 w-auto drop-shadow-md" />
        </div>

        {/* El componente Login debe llamar a onOk(token) al validar */}
        <Login onOk={handleOk} />

        {err && (
          <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            {err}
          </p>
        )}
      </div>
    </main>
  );
}
