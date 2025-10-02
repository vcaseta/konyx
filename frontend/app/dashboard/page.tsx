"use client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type TabKey = "empresa" | "fecha" | "proyecto" | "cuenta" | "config";

export default function DashboardPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>("empresa");

  // Comprobar sesión en cliente
  useEffect(() => {
    const t = typeof window !== "undefined" ? localStorage.getItem("konyx_token") : null;
    if (!t) {
      router.replace("/"); // si no hay token volvemos al login
    } else {
      setToken(t);
    }
  }, [router]);

  if (!token) {
    // Pantalla en blanco mientras comprobamos sesión
    return null;
  }

  return (
    <main
      className="min-h-screen bg-no-repeat bg-center bg-cover p-0 m-0"
      style={{
        backgroundImage: "url(/fondo.png)",
        backgroundSize: "100% 100%",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Contenedor principal: sidebar izquierda + contenido */}
      <div className="min-h-screen bg-white/70 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Sidebar */}
          <aside className="md:col-span-4 lg:col-span-3">
            <div className="sticky top-6 space-y-4">
              {/* Logo arriba */}
              <div className="flex justify-center pb-2">
                <img src="/logo.png" alt="Konyx" className="h-16 w-auto" />
              </div>

              <nav className="rounded-2xl border bg-white/90 shadow-sm overflow-hidden">
                <SidebarButton active={tab==="empresa"} onClick={() => setTab("empresa")} label="Empresa seleccionada" />
                <SidebarButton active={tab==="fecha"}   onClick={() => setTab("fecha")}   label="Fecha factura" />
                <SidebarButton active={tab==="proyecto"} onClick={() => setTab("proyecto")} label="Proyecto" />
                <SidebarButton active={tab==="cuenta"}  onClick={() => setTab("cuenta")}  label="Cuenta contable" />
                <SidebarButton active={tab==="config"}  onClick={() => setTab("config")}  label="Configuración" />
              </nav>
            </div>
          </aside>

          {/* Contenido */}
          <section className="md:col-span-8 lg:col-span-9">
            <div className="rounded-2xl border bg-white/95 shadow-sm p-6">
              {tab === "empresa" && <EmpresaView />}
              {tab === "fecha"   && <FechaView />}
              {tab === "proyecto"&& <ProyectoView />}
              {tab === "cuenta"  && <CuentaView />}
              {tab === "config"  && <ConfigView />}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function SidebarButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-4 py-3 border-b last:border-b-0 transition
        ${active ? "bg-indigo-600 text-white" : "bg-white/0 hover:bg-indigo-50"}`}
    >
      {label}
    </button>
  );
}

/* ---- Vistas de contenido (placeholders) ---- */

function EmpresaView() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Empresa seleccionada</h2>
      <p className="text-sm text-gray-600">Aquí mostraremos la empresa activa, conmutador entre empresas y resumen.</p>
    </div>
  );
}

function FechaView() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Fecha factura</h2>
      <p className="text-sm text-gray-600">Selector de fecha de emisión / vencimiento y rango por defecto.</p>
    </div>
  );
}

function ProyectoView() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Proyecto</h2>
      <p className="text-sm text-gray-600">Listado/selector de proyectos y detalle del seleccionado.</p>
    </div>
  );
}

function CuentaView() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Cuenta contable</h2>
      <p className="text-sm text-gray-600">Selector de cuenta, validaciones y vista previa de asientos.</p>
    </div>
  );
}

function ConfigView() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Configuración</h2>
      <p className="text-sm text-gray-600">Preferencias de la app (empresa por defecto, API Holded, etc.).</p>
    </div>
  );
}
