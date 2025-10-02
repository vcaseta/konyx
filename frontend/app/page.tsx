// app/page.tsx
import Login from "./components/Login";

export default function Page() {
  return (
    <main
      className="min-h-screen bg-no-repeat bg-center bg-cover flex items-center justify-center p-4"
      style={{
        backgroundImage: 'url(/fondo.png)',
        backgroundSize: 'cover', // ajusta el fondo al viewport
      }}
    >
      {/* Contenedor en columna: LOGO ARRIBA + LOGIN DEBAJO */}
      <div className="w-full max-w-[420px] flex flex-col items-center">
        {/* Logo centrado */}
        <img
          src="/logo.png"
          alt="Konyx"
          className="w-full max-w-[300px] h-auto mb-6"
        />

        {/* Formulario */}
        <Login onOk={() => {}} />
      </div>
    </main>
  );
}
