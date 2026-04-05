import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel handles output automatically - do NOT use "standalone" for Vercel
  typescript: {
    ignoreBuildErrors: false,
  },
  reactStrictMode: false,
};

export default nextConfig;
