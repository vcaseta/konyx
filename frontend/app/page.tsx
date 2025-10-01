"use client";

import { useRouter } from "next/navigation";
import Login from "./components/Login";

export default function HomePage() {
  const router = useRouter();

  const handleLogin = (token: string) => {
    // Guardamos el token y vamos al dashboard
    localStorage.setItem("konyx_token", token);
    router.push("/dashboard");
  };

  return (
    <main
      className="min-h-screen bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center px-4 py-10"
      style={{ backgroundImage: 'url(/fondo.png)' }}
    >
      {/* Logo grande arriba, sin overlays ni paneles extra */}
      <div className="flex justify-center mb-6 -mt-6 md:-mt-12">
        <img
          src="/logo.png"
          alt="Konyx"
          className="h-28 md:h-40 lg:h-48 w-auto drop-shadow-md"
        />
      </div>

      {/* Solo el cuadro de credenciales (Login) */}
      <div className="w-full max-w-sm">
        <Login onOk={handleLogin} />
      </div>
    </main>
  );
}

  );
}

