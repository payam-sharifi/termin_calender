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
    // CRITICAL: Disable navigation fallback to prevent Service Worker from intercepting
    // React Server Component requests. Navigation fallback can cause RSC hydration failures.
    // Set to null to disable (Workbox requires null or string, not false)
    navigateFallback: null,
    
    // Safety measure: Explicitly deny RSC routes from any navigation handling
    // This ensures these routes are NEVER intercepted by the Service Worker
    navigateFallbackDenylist: [
      /^\/_next\/.*/,      // Next.js internal routes (_next/static, _next/data, _next/image, etc.)
      /^\/_rsc\/.*/,       // React Server Components requests - CRITICAL for App Router
      /^\/api\/.*/,        // API routes
      /^\/sw\.js$/,        // Service worker itself
      /^\/manifest\.json$/, // Manifest file
    ],
    
    // Exclude Next.js internal routes from build-time precaching
    // These routes should NEVER be precached as they are dynamic and versioned
    exclude: [
      /^\/_next\/.*/,      // Next.js internal routes (_next/static, _next/data, etc.)
      /^\/_rsc\/.*/,       // React Server Components requests
      /^\/api\/.*/,        // API routes
      /^\/.*\.(?:json|xml|txt)$/, // JSON/XML/TXT files
    ],
    
    // Runtime caching - ONLY for non-RSC routes
    // RSC routes are explicitly excluded and will bypass the Service Worker entirely
    runtimeCaching: [
      {
        // CRITICAL: This pattern MUST return false for RSC routes
        // When false, the route is NOT registered with Workbox and will bypass the Service Worker
        urlPattern: ({ url }) => {
          const pathname = url.pathname;
          
          // NEVER intercept React Server Component routes
          if (pathname.startsWith('/_rsc/')) return false;
          
          // NEVER intercept Next.js internal routes (includes _next/data, _next/image, etc.)
          if (pathname.startsWith('/_next/')) return false;
          
          // NEVER intercept API routes
          if (pathname.startsWith('/api/')) return false;
          
          // NEVER intercept service worker itself
          if (pathname === '/sw.js') return false;
          
          // NEVER intercept manifest
          if (pathname === '/manifest.json') return false;
          
          // Only cache non-critical static assets and page navigations
          // Note: Even these use NetworkOnly, so they go directly to network
          return true;
        },
        handler: "NetworkOnly", // All matching requests go directly to network (no caching)
        options: {
          cacheName: "app-cache",
        },
      },
    ],
  },
});

export default pwaConfig(nextConfig);
