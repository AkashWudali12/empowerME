// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
      appDir: true, // Enable the App Router feature
  },
};

export default nextConfig;