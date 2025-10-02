"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  // Guardia básica: si no hay token en localStorage, vuelve al login
  useEffect(() => {
    const t = localStorage.getItem("konyx_token");
    if (!t) router.replace("/");
  }, [router]);

  return (
    <div className="min-h-screen w-full bg-gray-50">
      {/* Header común */}
      <header className="w-full border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Konyx" className="h-7 w-auto" />
            <span className="text-sm text-gray-400">Dashboard</span>
          </div>
          <div className="text-sm text-gray-500">Versión 1.0</div>
        </div>
      </header>

      {/* Contenedor principal */}
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
