/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: '.next',   // default, no need for 'out'
  images: {
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: ['@radix-ui/react-*'],
  },
};

module.exports = nextConfig;
