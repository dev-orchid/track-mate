import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Output configuration for production
  output: 'standalone',

  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },

  // Optimize images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    unoptimized: false,
  },

  // Disable x-powered-by header for security
  poweredByHeader: false,

  // Compression
  compress: true,

  // TypeScript and ESLint configuration
  typescript: {
    // Optionally: ignoreBuildErrors: true for faster builds (not recommended for production)
    ignoreBuildErrors: false,
  },
  eslint: {
    // Optionally: ignoreDuringBuilds: true for faster builds (not recommended for production)
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
