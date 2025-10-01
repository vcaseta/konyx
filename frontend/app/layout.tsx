import "./globals.css";
import { AuthProvider } from "./context/AuthContext";

export const metadata = { title: process.env.NEXT_PUBLIC_APP_NAME || "Konyx" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
