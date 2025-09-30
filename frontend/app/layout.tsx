import './globals.css';

export const metadata = {
  title: 'Konyx',
  description: 'Facturación interna',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
