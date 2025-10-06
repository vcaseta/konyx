import "../styles/globals.css"; // importa Tailwind
import { AuthProvider } from "../context/authContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
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
