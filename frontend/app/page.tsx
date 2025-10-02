// app/page.tsx
"use client";

export const dynamic = 'force-dynamic'; // ✅ evita SSG
export const revalidate = 0;            // ✅ sin caché estática

import { useState } from "react";
import Login from "./components/Login";

export default function Page() {
  const [token, setToken] = useState<string | null>(null);

  return (
    <main
      className="min-h-screen bg-no-repeat bg-center bg-cover flex items-center justify-center p-4"
      style={{
        backgroundImage: 'url(/fondo.png)',
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="w-full max-w-sm">
        {/* Logo SIEMPRE encima */}
        <div className="flex justify-center mb-6">
          <img
            src="/logo.png"
            alt="Konyx"
            className="h-28 w-auto drop-shadow-md"
          />
        </div>

        {!token ? (
          <Login onOk={(t) => setToken(t)} />
        ) : (
          <div className="bg-white/90 backdrop-blur rounded-2xl shadow p-6 text-center">
            <p className="text-sm text-gray-700">
              Sesión iniciada. Redirigiendo al panel…
            </p>
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  localStorage.setItem('konyx_token', ${JSON.stringify(
                    token
                  )});
                  window.location.href = '/dashboard';
                `,
              }}
            />
          </div>
        )}
      </div>
    </main>
  );
}
