import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Same-origin proxy: the browser calls /api/core/* and /api/auth/* on Vercel,
  // Next rewrites them to Render. This keeps the auth cookie first-party (bound
  // to the Vercel host) so it works in every browser, Safari included.
  async rewrites() {
    return [
      {
        source: '/api/core/:path*',
        destination: `${process.env.CORE_PROXY_TARGET || 'https://apexmotors-core-service.onrender.com/core'}/:path*`,
      },
      {
        source: '/api/auth/:path*',
        destination: `${process.env.AUTH_PROXY_TARGET || 'https://apexmotors-auth-service.onrender.com/auth'}/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      }
    ],
  },
};

export default nextConfig;
