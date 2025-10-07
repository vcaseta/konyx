/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  webpack(config) {
    // Alias '@' apunta a la carpeta 'frontend'
    config.resolve.alias['@'] = path.resolve(__dirname, 'frontend');
    return config;
  },
};

module.exports = nextConfig;
