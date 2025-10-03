// app/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Login from "./components/Login";

export const dynamic = "force-dynamic";

export default function Page() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);

  function handleOk(t: string) {
    if (!t) return;          // seguridad extra: no navegamos sin token
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
        {/* Logo arriba */}
        <div className="flex justify-center mb-6">
          <img src="/logo.png" alt="Konyx" className="h-96 w-auto drop-shadow-md" />
        </div>

        {!token ? (
          <Login onOk={handleOk} />
        ) : (
          <div className="text-white text-center">Redirigiendo…</div>
        )}
      </div>
    </main>
  );
}

