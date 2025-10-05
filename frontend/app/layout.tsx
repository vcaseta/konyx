import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "Konyx",
  description: "Dashboard Konyx",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-gray-100 font-sans">{children}</body>
    </html>
  );
}
