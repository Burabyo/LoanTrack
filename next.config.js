/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true, // optional
  },
  experimental: {
    optimizePackageImports: ['@radix-ui/react-*'],
  },
};

module.exports = nextConfig;

