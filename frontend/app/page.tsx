// app/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Login from "./components/Login";

export default function Page() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);

  async function handleOk(t: string) {
    // Guardamos token SOLO en sessionStorage (no persiste entre pestañas/cierres)
    sessionStorage.setItem("token", t);
    // Marcamos que esta sesión debe arrancar con estados limpios en el dashboard
    sessionStorage.setItem("reset-dashboard-state", "1");
    setToken(t);
    router.push("/dashboard");
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
        {/* Logo arriba, grande */}
        <div className="flex justify-center mb-6">
          <img
            src="/logo.png"
            alt="Konyx"
            className="h-24 w-auto drop-shadow-md"
          />
        </div>

        {/* Login */}
        <Login onOk={handleOk} />
      </div>
    </main>
  );
}
