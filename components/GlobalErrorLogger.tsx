"use client";

import { useEffect } from "react";

/**
 * Global Error Logger Component
 * 
 * Captures all unhandled errors and promise rejections to help diagnose
 * white screen issues. Since Nginx logs aren't showing these errors,
 * this component logs them to console and optionally sends them to a backend.
 * 
 * This is critical for debugging issues on mobile devices where we can't
 * easily access console logs.
 */
export default function GlobalErrorLogger() {
  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    // Function to format error information
    const formatErrorInfo = (error: Error | string, source?: string) => {
      const errorInfo = {
        message: typeof error === "string" ? error : error.message,
        stack: typeof error === "object" && error.stack ? error.stack : "No stack trace",
        source: source || "unknown",
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
      };

      return errorInfo;
    };

    // Function to log error (can be extended to send to backend)
    const logError = (errorInfo: ReturnType<typeof formatErrorInfo>) => {
      // Console log for immediate debugging
      console.error("[Global Error Logger]", errorInfo);

      // Optional: Send to backend for logging
      // Uncomment and configure if you want to send errors to your backend
      /*
      try {
        fetch("/api/log-error", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(errorInfo),
        }).catch((err) => {
          console.error("[Global Error Logger] Failed to send error to backend:", err);
        });
      } catch (err) {
        console.error("[Global Error Logger] Error sending to backend:", err);
      }
      */
    };

    // Handle unhandled JavaScript errors
    const handleError = (event: ErrorEvent) => {
      const errorInfo = formatErrorInfo(
        event.error || event.message,
        event.filename || "script"
      );
      logError(errorInfo);

      // Prevent default browser error handling if needed
      // event.preventDefault();
    };

    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason instanceof Error 
        ? event.reason 
        : new Error(String(event.reason));
      
      const errorInfo = formatErrorInfo(error, "unhandledRejection");
      logError(errorInfo);

      // Prevent default browser error handling if needed
      // event.preventDefault();
    };

    // Handle React error boundaries (if using React 16+)
    const originalConsoleError = console.error;
    console.error = (...args) => {
      // Check if this is a React error
      const errorString = args.join(" ");
      if (
        errorString.includes("Error:") ||
        errorString.includes("Warning:") ||
        errorString.includes("Uncaught")
      ) {
        const errorInfo = formatErrorInfo(
          new Error(errorString),
          "react-console-error"
        );
        logError(errorInfo);
      }
      // Call original console.error
      originalConsoleError.apply(console, args);
    };

    // Register error handlers
    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    // Log when component mounts (helps verify it's working)
    console.log("[Global Error Logger] Error logging initialized");

    // Cleanup function
    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
      console.error = originalConsoleError;
    };
  }, []);

  // This component doesn't render anything
  return null;
}
