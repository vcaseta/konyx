"use client";

import { useState } from "react";
import Image from "next/image";
import Login from "./components/Login";
import logo from "../public/logo.png"; // asegúrate de tener el logo en /frontend/public/

export default function HomePage() {
  const [token, setToken] = useState<string | null>(null);

  const onLogin = (user: string, pass: string) => {
    // Aquí irá la lógica real de login con tu backend
    if (user && pass) {
      setToken("dummy-token");
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-300">
      {!token ? (
        <>
          {/* Logo grande */}
          <div className="mb-8">
            <Image src={logo} alt="Konyx Logo" width={220} height={220} priority />
          </div>

          {/* Caja de login */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold text-center mb-6">Acceso a Konyx</h2>
            <Login onSubmit={onLogin} />
          </div>
        </>
      ) : (
        <section className="bg-white rounded-2xl p-6 shadow">
          <h2 className="text-lg font-semibold mb-2">Bienvenido a Konyx</h2>
          <p className="text-gray-600">Ya tienes sesión iniciada.</p>
        </section>
      )}
    </main>
  );
}

    </main>
  );
}
