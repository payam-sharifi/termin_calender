"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Offline Fallback Page
 * 
 * This page is displayed when the user is offline and tries to access
 * a route that hasn't been cached by the service worker.
 * 
 * Features:
 * - Detects online/offline status
 * - Provides retry functionality
 * - Shows helpful offline message
 */
export default function OfflinePage() {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    // Only run on client
    if (typeof window === "undefined" || typeof navigator === "undefined") {
      return;
    }

    // Check initial online status
    setIsOnline(navigator.onLine);

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleRetry = () => {
    if (isOnline) {
      router.push("/");
      router.refresh();
    }
  };

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        background: "linear-gradient(120deg, #e0f2fe 0%, #f8fafc 100%)",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <div
        style={{
          textAlign: "center",
          maxWidth: "500px",
          background: "white",
          padding: "40px",
          borderRadius: "16px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Offline Icon */}
        <div
          style={{
            fontSize: "64px",
            marginBottom: "20px",
          }}
        >
          📡
        </div>

        <h1
          style={{
            fontSize: "28px",
            fontWeight: "bold",
            marginBottom: "16px",
            color: "#1e293b",
          }}
        >
          You're Offline
        </h1>

        <p
          style={{
            fontSize: "16px",
            color: "#64748b",
            marginBottom: "32px",
            lineHeight: "1.6",
          }}
        >
          {isOnline
            ? "You're back online! Click retry to reload the page."
            : "It looks like you're not connected to the internet. Please check your connection and try again."}
        </p>

        {/* Status Indicator */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            marginBottom: "24px",
            padding: "12px",
            background: isOnline ? "#dcfce7" : "#fee2e2",
            borderRadius: "8px",
          }}
        >
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              background: isOnline ? "#22c55e" : "#ef4444",
              animation: isOnline ? "pulse 2s infinite" : "none",
            }}
          />
          <span
            style={{
              fontSize: "14px",
              fontWeight: "500",
              color: isOnline ? "#166534" : "#991b1b",
            }}
          >
            {isOnline ? "Online" : "Offline"}
          </span>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={handleRetry}
            disabled={!isOnline}
            style={{
              padding: "12px 24px",
              fontSize: "16px",
              fontWeight: "600",
              color: "white",
              background: isOnline ? "#0ea5e9" : "#94a3b8",
              border: "none",
              borderRadius: "8px",
              cursor: isOnline ? "pointer" : "not-allowed",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              if (isOnline) {
                e.currentTarget.style.background = "#0284c7";
                e.currentTarget.style.transform = "scale(1.05)";
              }
            }}
            onMouseLeave={(e) => {
              if (isOnline) {
                e.currentTarget.style.background = "#0ea5e9";
                e.currentTarget.style.transform = "scale(1)";
              }
            }}
          >
            Retry
          </button>

          <button
            onClick={handleGoHome}
            style={{
              padding: "12px 24px",
              fontSize: "16px",
              fontWeight: "600",
              color: "#0ea5e9",
              background: "white",
              border: "2px solid #0ea5e9",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f0f9ff";
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "white";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            Go Home
          </button>
        </div>

        {/* Helpful Tips */}
        <div
          style={{
            marginTop: "32px",
            padding: "16px",
            background: "#f1f5f9",
            borderRadius: "8px",
            fontSize: "14px",
            color: "#475569",
            textAlign: "left",
          }}
        >
          <p style={{ margin: "0 0 8px 0", fontWeight: "600" }}>
            💡 Tips while offline:
          </p>
          <ul style={{ margin: 0, paddingLeft: "20px" }}>
            <li>Previously visited pages may still be available</li>
            <li>Check your internet connection</li>
            <li>Try refreshing once you're back online</li>
          </ul>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}

