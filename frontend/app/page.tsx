"use client";

import { useRouter } from "next/navigation";
import Login from "./components/Login";
import Cookies from "js-cookie";

export const dynamic = "force-dynamic";

export default function Page() {
  const router = useRouter();

  async function handleOk(token: string) {
    // Guardar JWT en cookie (1 día de expiración)
    try {
      Cookies.set("konyx_token", token, { expires: 1 });
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
        {/* Formulario de login */}
        <Login onOk={handleOk} />
      </div>
    </main>
  );
}
