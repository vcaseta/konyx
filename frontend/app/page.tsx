"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Login from "./components/Login";

export const dynamic = "force-dynamic";

export default function Page() {
  const router = useRouter();

  // Si ya hay token, redirigir automáticamente al dashboard
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      router.push("/dashboard");
    }
  }, []);

  async function handleOk(token: string) {
    try {
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("reset-dashboard-state", "1");
    } catch {}
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
      <div className="w-full max-w-sm bg-white bg-opacity-80 rounded-xl shadow-md p-6 backdrop-blur">
        {/* Logo dentro del cuadro */}
        <div className="flex justify-center mb-6">
          <img
            src="/logo.png"
            alt="Konyx"
            className="h-96 w-auto drop-shadow-md"
          />
        </div>

        {/* Formulario de acceso */}
        <Login onOk={handleOk} />
      </div>
    </main>
  );
}
