"use client";

import { useEffect, useRef } from "react";

/**
 * Service Worker Cleanup Component
 * 
 * This component performs a one-time cleanup of service workers and caches
 * to resolve "White Screen of Death" issues caused by corrupted service workers.
 * 
 * Features:
 * - Unregisters all service workers
 * - Clears all browser caches
 * - Force-reloads the page once after cleanup
 * - Safe for SSR (only runs on client)
 * - Only runs once per session
 */
export default function ServiceWorkerCleanup() {
  const hasRunRef = useRef(false);
  const cleanupInProgressRef = useRef(false);

  useEffect(() => {
    // Only run on client
    if (typeof window === "undefined") {
      return;
    }

    // Only run once per session
    if (hasRunRef.current || cleanupInProgressRef.current) {
      return;
    }

    // Check if cleanup was already performed in this session
    const cleanupPerformed = sessionStorage.getItem("sw-cleanup-performed");
    if (cleanupPerformed === "true") {
      return;
    }

    cleanupInProgressRef.current = true;

    const performCleanup = async () => {
      try {
        console.log("[SW Cleanup] Starting service worker cleanup...");

        // Step 1: Unregister all service workers
        if ("serviceWorker" in navigator) {
          try {
            const registrations = await navigator.serviceWorker.getRegistrations();
            console.log(`[SW Cleanup] Found ${registrations.length} service worker(s) to unregister`);

            await Promise.all(
              registrations.map(async (registration) => {
                try {
                  const unregistered = await registration.unregister();
                  console.log(
                    `[SW Cleanup] Service worker unregistered: ${unregistered ? "success" : "failed"}`
                  );
                } catch (error) {
                  console.error("[SW Cleanup] Error unregistering service worker:", error);
                }
              })
            );
          } catch (error) {
            console.error("[SW Cleanup] Error getting service worker registrations:", error);
          }
        }

        // Step 2: Clear all caches
        if ("caches" in window) {
          try {
            const cacheNames = await caches.keys();
            console.log(`[SW Cleanup] Found ${cacheNames.length} cache(s) to delete`);

            await Promise.all(
              cacheNames.map(async (cacheName) => {
                try {
                  const deleted = await caches.delete(cacheName);
                  console.log(
                    `[SW Cleanup] Cache "${cacheName}" deleted: ${deleted ? "success" : "failed"}`
                  );
                } catch (error) {
                  console.error(`[SW Cleanup] Error deleting cache "${cacheName}":`, error);
                }
              })
            );
          } catch (error) {
            console.error("[SW Cleanup] Error accessing caches:", error);
          }
        }

        // Mark cleanup as performed in session storage
        try {
          sessionStorage.setItem("sw-cleanup-performed", "true");
        } catch (error) {
          console.error("[SW Cleanup] Error setting session storage:", error);
        }

        console.log("[SW Cleanup] Cleanup completed successfully");

        // Step 3: Force-reload the page once after cleanup
        // Use a small delay to ensure cleanup is complete
        setTimeout(() => {
          console.log("[SW Cleanup] Force-reloading page...");
          // Use window.location.reload() with force reload
          // The 'true' parameter is deprecated but some browsers still respect it
          if (window.location.reload) {
            window.location.reload();
          } else {
            window.location.href = window.location.href;
          }
        }, 500);
      } catch (error) {
        console.error("[SW Cleanup] Fatal error during cleanup:", error);
        cleanupInProgressRef.current = false;
      }
    };

    // Run cleanup after a short delay to ensure DOM is ready
    const timeoutId = setTimeout(performCleanup, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  // This component doesn't render anything
  return null;
}
