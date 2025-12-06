/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: '.next',   // default, no need for 'out'
  images: {
    unoptimized: true,
  },
 experimental: {
  appDir: true,
  optimizePackageImports: ['@radix-ui/react-*'],
},
};

module.exports = nextConfig;
