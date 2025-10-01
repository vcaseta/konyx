"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "./context/AuthContext";
import api from "./lib/api";
import Login from "./components/Login";   // tu componente existente
import Logo from "./components/Logo";     // si prefieres imagen, usa la <Image /> de abajo
import { useEffect, useState } from "react";

export default function Page() {
  const router = useRouter();
  const { token, login } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  // Si ya hay token, ir directo al dashboard
  useEffect(() => {
    if (token) router.replace("/dashboard");
  }, [token, router]);

  const handleLogin = async (user: string, pass: string) => {
    try {
      setSubmitting(true);
      // Llama a tu backend real:
      // const { data } = await api.post("/auth/login", { user, pass });
      // login(data.token);

      // Mientras tanto, demo:
      const { data } = await api.post("/auth/login", { user, pass });
      login(data.token || "demo-token");
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      alert("No se pudo iniciar sesión");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        backgroundImage: "url('/fondo.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="w-full max-w-md">
        {/* LOGO grande */}
        <div className="flex flex-col items-center mb-6 select-none">
          {/* Opción 1: tu componente de logo vectorial */}
          {/* <Logo className="h-20 w-auto" /> */}

          {/* Opción 2: imagen PNG (logo.png en /public) */}
          <Image
            src="/logo.png"
            alt="Konyx"
            width={420}
            height={120}
            priority
            className="h-auto w-auto max-w-[420px]"
          />
        </div>

        {/* Caja de login */}
        <div className="rounded-2xl backdrop-blur bg-white/85 shadow-xl p-6">
          <h1 className="text-2xl font-semibold text-center mb-4">Accede a Konyx</h1>

          {/* Tu componente Login debe aceptar onSubmit(user, pass) */}
          <Login onSubmit={handleLogin} />

          {/* Estado de envío */}
          {submitting && (
            <p className="text-center text-sm text-gray-600 mt-3">Validando credenciales…</p>
          )}
        </div>

        {/* Pie ligero */}
        <p className="text-center text-xs text-white/80 mt-6">
          © {new Date().getFullYear()} Konyx
        </p>
      </div>
    </main>
  );
}

