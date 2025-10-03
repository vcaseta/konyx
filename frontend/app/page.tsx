// app/page.tsx
"use client";

import { useRouter } from "next/navigation";
import Login from "./components/Login";

export const dynamic = "force-dynamic";

export default function Page() {
  const router = useRouter();

  return (
    <main
      className="min-h-screen bg-no-repeat bg-center bg-cover flex items-center justify-center p-6"
      style={{
        backgroundImage: "url(/fondo.png)",
        backgroundSize: "100% 100%",
      }}
    >
      <div className="w-full max-w-sm">
        {/* Logo SIEMPRE encima del formulario */}
        <div className="flex justify-center mb-6">
          <img
            src="/logo.png"
            alt="Konyx"
            className="h-128 w-auto"
          />
        </div>

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
