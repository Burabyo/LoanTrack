/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', // tells Next.js to create a static export in the 'out' folder
  images: {
    unoptimized: true, // required for Firebase static hosting
  },
  experimental: {
    optimizePackageImports: ['@radix-ui/react-*'], // optional for Radix UI optimization
  },
};

module.exports = nextConfig;
