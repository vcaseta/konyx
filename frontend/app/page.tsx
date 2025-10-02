"use client";

import Image from "next/image";
import { useState } from "react";
import Login from "./components/Login";

export default function Page() {
  const [token, setToken] = useState<string | null>(null);

  return (
    <main
      className="min-h-screen bg-cover bg-center bg-no-repeat flex flex-col items-center"
      style={{ backgroundImage: "url(/fondo.png)" }}
    >
      {/* Logo grande, pegado arriba */}
      <header className="w-full flex justify-center pt-10 sm:pt-14">
        <Image
          src="/logo.png"
          alt="Konyx"
          width={480}
          height={140}
          priority
          className="h-auto w-[260px] sm:w-[360px] md:w-[480px]"
        />
      </header>

      {/* Contenedor del formulario */}
      <section className="w-full max-w-sm px-4 mt-6 sm:mt-10">
        {!token && <Login onOk={setToken} />}
      </section>
    </main>
  );
}
