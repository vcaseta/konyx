import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Konyx",
  description: "Facturación Holded multiempresa desde Excel"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
