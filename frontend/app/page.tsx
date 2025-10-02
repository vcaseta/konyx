"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Login from "./components/Login";

export default function Page() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);

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
          <img src="/logo.png" alt="Konyx" className="h-28 w-auto drop-shadow-md" />
        </div>

        {!token ? (
          <Login
            onOk={(t: string) => {
              setToken(t);
              try { localStorage.setItem("konyx_token", t); } catch {}
              router.push("/dashboard");
            }}
          />
        ) : null}
      </div>
    </main>
  );
}
