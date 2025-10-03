@@ -1,58 +1,39 @@
// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Login from "./components/Login";
import { getSavedToken } from "./lib/api";

export const dynamic = "force-dynamic";

export default function Page() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);

  // Al cargar, si ya hay token guardado, redirige:
  useEffect(() => {
    const t = getSavedToken();
    if (t) {
      setToken(t);
      router.push("/dashboard");
    }
  }, [router]);

  // Si acabamos de logearnos, también redirige:
  useEffect(() => {
    if (token) {
      router.push("/dashboard");
    }
  }, [token, router]);

  return (
    <main
      className="min-h-screen bg-no-repeat bg-center bg-cover flex items-center justify-center p-4"
      className="min-h-screen bg-no-repeat bg-center bg-cover flex items-center justify-center p-6"
      style={{
        backgroundImage: "url(/fondo.png)",
        backgroundSize: "100% 100%",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="w-full max-w-sm">
        {/* Logo siempre arriba */}
        {/* Logo SIEMPRE encima del formulario */}
        <div className="flex justify-center mb-6">
          <img src="/logo.png" alt="Konyx" className="h-48 w-auto drop-shadow-md" />
          <img
            src="/logo.png"
            alt="Konyx"
            className="h-24 w-auto"
          />
        </div>

        {/* Mientras no haya token, mostramos login */}
        {!token ? (
          <Login onOk={(t: string) => setToken(t)} />
        ) : (
          <div className="bg-white/90 backdrop-blur rounded-2xl shadow p-6 text-center">
            <p className="text-sm text-gray-700">Entrando al panel…</p>
          </div>
        )}
        {/* Componente de login: él maneja su propio error y petición */}
        <Login onOk={(token: string) => {
          // No guardamos token => forzamos login siempre en cada visita.
          // Tras login correcto, navegamos al dashboard.
          router.push("/dashboard");
        }}/>
      </div>
    </main>
  );
}

