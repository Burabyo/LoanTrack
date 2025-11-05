/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true // required if using Firebase Storage images
  },
  experimental: {
    optimizePackageImports: ['@radix-ui/react-*']
  }
};

module.exports = nextConfig;
