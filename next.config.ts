import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  generateBuildId: async () => 'build-' + Date.now(),

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, proxy-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, proxy-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
          { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, proxy-revalidate' },
          { key: 'Content-Type', value: 'application/manifest+json; charset=utf-8' },
        ],
      },
    ];
  },
};

const pwaConfig = withPWA({
  dest: "public",
  register: true,
  sw: "/sw.js",
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    // Exclude Next.js internal routes from service worker
    // These are critical for App Router and RSC (React Server Components)
    exclude: [
      /^\/_next\/.*/, // Next.js internal routes (_next/static, _next/data, etc.)
      /^\/_rsc\/.*/, // React Server Components requests
      /^\/api\/.*/, // API routes (if any)
      /^\/.*\.(?:json|xml|txt)$/, // JSON/XML/TXT files
    ],
    // Runtime caching - NetworkOnly for all routes
    runtimeCaching: [
      {
        // Exclude Next.js internal routes and RSC requests
        urlPattern: ({ url }) => {
          // Don't cache Next.js internal routes
          if (url.pathname.startsWith('/_next/')) return false;
          if (url.pathname.startsWith('/_rsc/')) return false;
          if (url.pathname.startsWith('/api/')) return false;
          // Don't cache service worker itself
          if (url.pathname === '/sw.js') return false;
          // Don't cache manifest
          if (url.pathname === '/manifest.json') return false;
          return true;
        },
        handler: "NetworkOnly", // All requests go directly to network
        options: {
          cacheName: "app-cache",
        },
      },
    ],
  },
});

export default pwaConfig(nextConfig);
