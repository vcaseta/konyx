"use client";

import { useRouter } from "next/navigation";
import Login from "./components/Login";

export const dynamic = "force-dynamic";

export default function Page() {
  const router = useRouter();

  async function handleOk(token: string) {
    try {
      // Guardamos token en sesión y señal de reset de dashboard
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
        <div className="flex justify-center mb-6">
          <img
            src="/logo.png"
            alt="Konyx"
            className="h-24 w-auto drop-shadow-md"
          />
        </div>
        <Login onOk={handleOk} />
      </div>
    </main>
  );
}

