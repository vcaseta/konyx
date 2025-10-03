// app/page.tsx
"use client";

import { useRouter } from "next/navigation";
import Login from "./components/Login";

export default function Page() {
  const router = useRouter();

  function handleOk(token: string) {
    // Guardar cookie SÓLO para sesión actual (sin remember)
    document.cookie = `konyx_token=${token}; Path=/; SameSite=Lax`;
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
        {/* Logo encima del formulario (no cambiamos styling) */}
        <div className="flex justify-center mb-6">
          <img src="/logo.png" alt="Konyx" className="h-96 w-auto drop-shadow-md" />
        </div>

        <Login onOk={handleOk} />
      </div>
    </main>
  );
}

