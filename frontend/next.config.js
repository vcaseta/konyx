// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // IMPORTANTE: NO usar `output: "export"`
  output: "standalone",
  reactStrictMode: true,
  // (opcional) si usas imágenes remotas, ajusta domains aquí
  images: { unoptimized: true },
};

module.exports = nextConfig;
