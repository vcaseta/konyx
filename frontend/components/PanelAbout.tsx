"use client";

export function PanelAbout({ onBack }: { onBack?: () => void }) {
  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-lg text-gray-800">
      <div className="flex flex-col items-center text-center space-y-4">
        {/* Logo personal */}
        <img
          src="/LOGO VICTOR MAIL.jpg"
          alt="Víctor Mut Vallvey"
          className="h-24 w-auto drop-shadow-md rounded-md"
        />

        <h2 className="text-2xl font-bold text-indigo-700">Víctor Mut Vallvey</h2>
        <p className="text-sm font-medium text-gray-600 tracking-wide">
          Audiovisual Project Manager
        </p>

        <div className="mt-4 space-y-1 text-sm">
          <p>
            <strong>Autor:</strong> Víctor Mut Vallvey
          </p>
          <p>
            <strong>Contacto:</strong>{" "}
            <a
              href="mailto:victorbiaudio@gmail.com"
              className="text-indigo-600 hover:underline"
            >
              victorbiaudio@gmail.com
            </a>
          </p>
          <p>
            <strong>Versión:</strong> 1.0.0
          </p>
          <p>
            <strong>Fecha de creación:</strong> Octubre 2025
          </p>
        </div>

        <p className="mt-6 text-xs text-gray-500">
          © 2025 Víctor Mut Vallvey. Todos los derechos reservados.
        </p>

        <button
          onClick={onBack}
          className="mt-6 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 shadow transition"
        >
          ← Volver
        </button>
      </div>
    </div>
  );
}
