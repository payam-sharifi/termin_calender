"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

/**
 * PWA Update Prompt Component
 * 
 * This component detects when a new service worker version is available
 * and prompts the user to refresh the page to get the latest version.
 * 
 * Features:
 * - Detects service worker updates
 * - Shows user-friendly update prompt
 * - Handles update installation
 * - Works with next-pwa
 */
export default function PWAUpdatePrompt() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    // Register service worker update listener
    const handleServiceWorkerUpdate = async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        setRegistration(registration);

        // Listen for service worker updates
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              // New service worker is available
              setUpdateAvailable(true);
              showUpdateToast();
            }
          });
        });

        // Check for updates periodically (every 60 seconds)
        const updateInterval = setInterval(() => {
          registration.update();
        }, 60000);

        // Also check on page visibility change
        document.addEventListener("visibilitychange", () => {
          if (!document.hidden) {
            registration.update();
          }
        });

        return () => {
          clearInterval(updateInterval);
        };
      } catch (error) {
        console.error("Service Worker registration error:", error);
      }
    };

    // Wait for service worker to be ready
    if (navigator.serviceWorker.controller) {
      handleServiceWorkerUpdate();
    } else {
      navigator.serviceWorker.addEventListener("controllerchange", handleServiceWorkerUpdate);
    }
  }, []);

  const showUpdateToast = () => {
    toast.info(
      <div>
        <div style={{ fontWeight: "bold", marginBottom: "8px" }}>
          New version available!
        </div>
        <div style={{ fontSize: "14px", marginBottom: "12px" }}>
          A new version of the app is ready. Refresh to update.
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={handleUpdate}
            style={{
              padding: "6px 12px",
              background: "#0ea5e9",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
            Refresh Now
          </button>
          <button
            onClick={() => {
              toast.dismiss();
              setUpdateAvailable(false);
            }}
            style={{
              padding: "6px 12px",
              background: "transparent",
              color: "#64748b",
              border: "1px solid #cbd5e1",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Later
          </button>
        </div>
      </div>,
      {
        position: "top-right",
        autoClose: false,
        hideProgressBar: false,
        closeOnClick: false,
        draggable: true,
        toastId: "pwa-update",
      }
    );
  };

  const handleUpdate = async () => {
    if (!registration || !registration.waiting) {
      // If no waiting worker, reload the page
      window.location.reload();
      return;
    }

    setIsUpdating(true);

    try {
      // Tell the service worker to skip waiting and activate
      registration.waiting.postMessage({ type: "SKIP_WAITING" });

      // Wait a bit for the new service worker to activate
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Reload the page to use the new service worker
      window.location.reload();
    } catch (error) {
      console.error("Error updating service worker:", error);
      // Fallback: just reload
      window.location.reload();
    }
  };

  // Listen for messages from service worker
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "SW_UPDATED") {
        setUpdateAvailable(true);
        showUpdateToast();
      }
    };

    navigator.serviceWorker.addEventListener("message", handleMessage);

    return () => {
      navigator.serviceWorker.removeEventListener("message", handleMessage);
    };
  }, []);

  return null; // This component doesn't render anything visible
}

