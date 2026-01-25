"use client";
import type { Metadata } from "next";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Geist, Geist_Mono } from "next/font/google";
import "@/resources/main.scss";
import "react-big-calendar/lib/addons/dragAndDrop/styles.scss";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/services/queryClient";
import 'bootstrap-icons/font/bootstrap-icons.css';
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import useDecoder from "@/hooks/useDecoder";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { jwtDecode } from "jwt-decode";



//  const metadata: Metadata = {
//   title: "Booking Calendar",
//   description: "Booking Calendar",
// };

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [token, setToken] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true); // Add loading state
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check token synchronously on mount
    const t = typeof window !== 'undefined' ? localStorage.getItem('termin-token') : null;
    setToken(t);
    setIsChecking(false);

    if (!t && pathname !== "/auth/login" && !pathname.startsWith("/auth/")) {
      router.push("/auth/login");
    } else if (t && pathname === "/dashboard") {
      try {
        const decoded = jwtDecode<{ id: string }>(t);
        router.push(`/dashboard/service/${decoded.id}`);
      } catch (error) {
        // Invalid token
        console.error("Invalid token:", error);
        localStorage.removeItem('termin-token');
        router.push("/auth/login");
      }
    }
  }, [pathname, router]);

  // Show loading only while checking, not when token is null
  if (isChecking) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        width: '100vw',
        background: 'linear-gradient(120deg, #e0f2fe 0%, #f8fafc 100%)'
      }}>
        <div style={{
          textAlign: 'center',
          color: '#0ea5e9'
        }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p style={{ marginTop: '1rem', color: '#0ea5e9' }}>در حال بررسی...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {children}
    </>
  );
}
