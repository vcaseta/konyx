"use client";

import { useRouter } from "next/navigation";
import Login from "./components/Login";
import Cookies from "js-cookie";

export const dynamic = "force-dynamic";

export default function Page() {
  const router = useRouter();

  async function handleOk(token: string) {
    try {
      // Guardar token en cookie y sessionStorage
      Cookies.set("konyx_token", token, { sameSite: "strict" });
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
      <div className="w-full max-w-sm">
        {/* ----------------- Login Box ----------------- */}
        <div className="bg-white/90 backdrop-blur rounded-2xl shadow-lg p-6 space-y-6">
          {/* Logo dentro del cuadro */}
          <div className="flex justify-center mb-4">
            <img
              src="/logo.png"
              alt="Konyx"
              className="h-24 w-auto drop-shadow-md"
            />
          </div>

          {/* Formulario de login */}
          <Login onOk={handleOk} />
        </div>
      </div>
    </main>
  );
}
