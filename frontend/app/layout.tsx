import "../styles/globals.css"; // importa Tailwind
import { AuthProvider } from "./context/authContext";

export const metadata = {
  title: "Konyx",
  description: "Gestor de exportaciones Holded / Gestoría",
  icons: {
    icon: "/favicon.ico",            // ✅ icono principal (pestaña del navegador)
    shortcut: "/favicon.ico",        // ✅ para accesos directos/favoritos
    apple: "/logo.png",              // ✅ para pantallas de inicio en iOS
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        {/* 🔹 Esto refuerza el favicon en todos los navegadores */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <meta name="theme-color" content="#4F46E5" />
      </head>
      <body
        className="min-h-screen bg-no-repeat bg-center bg-cover"
        style={{ backgroundImage: "url(/fondo.png)", backgroundSize: "100% 100%" }}
      >
        <AuthProvider>
          <div className="min-h-screen flex flex-col">{children}</div>
        </AuthProvider>
      </body>
    </html>
  );
}
