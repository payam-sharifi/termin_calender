"use client";

import { useEffect, useRef } from "react";

/**
 * Service Worker Cleanup Component
 * 
 * This component aggressively unregisters all service workers and clears
 * all browser caches to prevent PWA-related white screen issues.
 * 
 * It runs once on mount and forces a reload after cleanup to ensure
 * users get a fresh version from the server.
 */
export default function ServiceWorkerCleanup() {
  const hasCleanedUp = useRef(false);

  useEffect(() => {
    // Prevent multiple cleanup attempts
    if (hasCleanedUp.current) return;
    hasCleanedUp.current = true;

    // Only run on client side
    if (typeof window === "undefined") return;

    const cleanup = async () => {
      try {
        // Step 1: Unregister all service workers
        if ("serviceWorker" in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          
          console.log(`[SW Cleanup] Found ${registrations.length} service worker(s) to unregister`);

          // Unregister all service workers
          const unregisterPromises = registrations.map((registration) => {
            return registration.unregister().then((success) => {
              if (success) {
                console.log("[SW Cleanup] Service worker unregistered successfully");
              } else {
                console.warn("[SW Cleanup] Service worker unregistration returned false");
              }
            });
          });

          await Promise.all(unregisterPromises);
        }

        // Step 2: Clear all caches
        if ("caches" in window) {
          const cacheNames = await caches.keys();
          console.log(`[SW Cleanup] Found ${cacheNames.length} cache(s) to delete`);

          const deletePromises = cacheNames.map((cacheName) => {
            return caches.delete(cacheName).then((deleted) => {
              if (deleted) {
                console.log(`[SW Cleanup] Cache "${cacheName}" deleted successfully`);
              }
            });
          });

          await Promise.all(deletePromises);
        }

        // Step 3: Clear localStorage and sessionStorage if needed (optional, uncomment if needed)
        // localStorage.clear();
        // sessionStorage.clear();

        // Step 4: Force reload to bypass any remaining cache
        // Only reload if we actually found service workers or caches
        const hadServiceWorkers = "serviceWorker" in navigator && 
          (await navigator.serviceWorker.getRegistrations()).length > 0;
        const hadCaches = "caches" in window && (await caches.keys()).length > 0;

        if (hadServiceWorkers || hadCaches) {
          console.log("[SW Cleanup] Cleanup complete, reloading page...");
          // Use replace instead of reload to prevent back button issues
          window.location.replace(window.location.href);
        } else {
          console.log("[SW Cleanup] No service workers or caches found, no reload needed");
        }
      } catch (error) {
        console.error("[SW Cleanup] Error during cleanup:", error);
        // Even if cleanup fails, try to reload to get fresh content
        try {
          window.location.replace(window.location.href);
        } catch (reloadError) {
          console.error("[SW Cleanup] Failed to reload:", reloadError);
        }
      }
    };

    // Run cleanup
    cleanup();
  }, []);

  // This component doesn't render anything
  return null;
}
