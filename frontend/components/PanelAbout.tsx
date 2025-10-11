"use client";

export function PanelAbout() {
  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-lg text-gray-800">
      <div className="flex flex-col items-center text-center space-y-6">
        {/* Logo personal (PNG transparente, sin bordes ni sombras) */}
        <img
          src="/logo-victor.png"
          alt="VM AV-TI Project Manager"
          className="h-64 w-auto"
        />

        <h2 className="text-3xl font-bold text-indigo-700 mt-4">
          VM Audiovisual Project Manager
        </h2>

        <div className="mt-2 space-y-1 text-sm">
          <p>
            <strong>Autor:</strong> Víctor Mut 
          </p>
          <p>
            <strong>Contacto:</strong>{" "}
            <a
              href="mailto:vcaseta75@gmail.com"
              className="text-indigo-600 hover:underline"
            >
              vcaseta75@gmail.com
            </a>
          </p>
          <p>
            <strong>Versión:</strong> 2.1.1
          </p>
          <p>
            <strong>Fecha de creación:</strong> Octubre 2025
          </p>
        </div>

        <p className="mt-6 text-xs text-gray-500">
          © 2025 VM Project Manager. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
