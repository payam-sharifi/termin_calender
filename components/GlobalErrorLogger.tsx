"use client";

import { useEffect } from "react";

/**
 * Global Error Logger Component
 * 
 * This component captures all unhandled errors and promise rejections
 * to help diagnose "White Screen of Death" issues.
 * 
 * Features:
 * - Captures window.onerror events
 * - Captures unhandled promise rejections
 * - Logs errors to console with full details
 * - Attempts to send errors to backend (if configured)
 * - Safe for SSR (only runs on client)
 */
export default function GlobalErrorLogger() {
  useEffect(() => {
    // Only run on client
    if (typeof window === "undefined") {
      return;
    }

    // Function to format error details
    const formatErrorDetails = (error: Error | string, source?: string, lineno?: number, colno?: number, stack?: string) => {
      const errorDetails = {
        message: typeof error === "string" ? error : error?.message || "Unknown error",
        source: source || "unknown",
        line: lineno || 0,
        column: colno || 0,
        stack: stack || (typeof error === "object" && error instanceof Error ? error.stack : undefined),
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
        url: typeof window !== "undefined" ? window.location.href : "unknown",
        timestamp: new Date().toISOString(),
        platform: typeof navigator !== "undefined" ? navigator.platform : "unknown",
        language: typeof navigator !== "undefined" ? navigator.language : "unknown",
      };

      return errorDetails;
    };

    // Function to log error (console + optional backend)
    const logError = async (errorDetails: ReturnType<typeof formatErrorDetails>, errorType: "error" | "rejection") => {
      // Always log to console for debugging
      console.error(`[Global Error Logger] ${errorType.toUpperCase()}:`, errorDetails);

      // Try to send to backend if API is available
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 
          (typeof window !== "undefined" 
            ? `${window.location.protocol}//${window.location.hostname}:4001` 
            : "");

        if (apiBaseUrl) {
          // Attempt to send error to backend (non-blocking)
          fetch(`${apiBaseUrl}/api/errors`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              type: errorType,
              ...errorDetails,
            }),
            // Don't wait for response - fire and forget
          }).catch((fetchError) => {
            // Silently fail - we don't want error logging to cause more errors
            console.warn("[Global Error Logger] Failed to send error to backend:", fetchError);
          });
        }
      } catch (error) {
        // Silently fail - we don't want error logging to cause more errors
        console.warn("[Global Error Logger] Error in error logging:", error);
      }
    };

    // Handler for window.onerror and error events
    const handleError = (
      eventOrError: ErrorEvent | Event | Error | string,
      source?: string,
      lineno?: number,
      colno?: number,
      error?: Error
    ) => {
      let errorMessage: string;
      let errorStack: string | undefined;
      let errorSource: string | undefined;
      let errorLineno: number | undefined;
      let errorColno: number | undefined;

      // Handle different input types
      if (eventOrError instanceof ErrorEvent) {
        // Called from addEventListener
        errorMessage = eventOrError.message || "Unknown error";
        errorStack = eventOrError.error?.stack;
        errorSource = eventOrError.filename;
        errorLineno = eventOrError.lineno;
        errorColno = eventOrError.colno;
      } else if (eventOrError instanceof Error) {
        // Called from window.onerror with Error object
        errorMessage = eventOrError.message;
        errorStack = eventOrError.stack;
        errorSource = source;
        errorLineno = lineno;
        errorColno = colno;
      } else if (typeof eventOrError === "string") {
        // Called from window.onerror with string message
        errorMessage = eventOrError;
        errorStack = error?.stack;
        errorSource = source;
        errorLineno = lineno;
        errorColno = colno;
      } else {
        // Event object (generic)
        errorMessage = "Unknown error";
        errorSource = source;
        errorLineno = lineno;
        errorColno = colno;
      }

      const errorDetails = formatErrorDetails(
        errorMessage,
        errorSource,
        errorLineno,
        errorColno,
        errorStack
      );

      logError(errorDetails, "error");
    };

    // Handler for unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason;
      let errorMessage = "Unhandled Promise Rejection";
      let errorStack: string | undefined;

      if (error instanceof Error) {
        errorMessage = error.message;
        errorStack = error.stack;
      } else if (typeof error === "string") {
        errorMessage = error;
      } else if (error && typeof error === "object") {
        errorMessage = JSON.stringify(error);
      }

      const errorDetails = formatErrorDetails(
        errorMessage,
        undefined,
        undefined,
        undefined,
        errorStack
      );

      logError(errorDetails, "rejection");
    };

    // Register error handlers
    window.addEventListener("error", handleError as EventListener, true);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    // Also set window.onerror for maximum compatibility
    const originalOnError = window.onerror;
    window.onerror = (
      message: string | Event,
      source?: string,
      lineno?: number,
      colno?: number,
      error?: Error
    ) => {
      // Pass the message directly - handleError will handle the type
      handleError(message, source, lineno, colno, error);
      
      // Call original handler if it exists
      if (originalOnError) {
        return originalOnError(message, source, lineno, colno, error);
      }
      
      return false;
    };

    // Cleanup function
    return () => {
      window.removeEventListener("error", handleError as EventListener, true);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
      window.onerror = originalOnError;
    };
  }, []);

  // This component doesn't render anything
  return null;
}
