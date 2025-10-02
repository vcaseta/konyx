// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  // No uses "export"; así evitamos el static export y el error de revalidate
  output: "standalone",
  reactStrictMode: true,
  images: { unoptimized: true },
};

export default nextConfig;
