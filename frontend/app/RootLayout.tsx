import { AuthProvider } from "../context/authContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          {/* Fondo global y contenedor principal */}
          <div
            className="min-h-screen bg-no-repeat bg-center bg-cover"
            style={{
              backgroundImage: "url(/fondo.png)",
              backgroundSize: "100% 100%",
            }}
          >
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
