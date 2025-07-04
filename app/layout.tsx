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
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import React from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

//  const metadata: Metadata = {
//   title: "Booking Calendar",
//   description: "Booking Calendar",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <style jsx global>{`
          html, body {
            overflow-x: hidden;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
          }
          @media (max-width: 768px) {
            html, body {
              overflow-x: hidden;
              overflow-y: auto;
              -webkit-overflow-scrolling: touch;
            }
          }
        `}</style>
      </head>
      <body style={{
        minHeight: '100vh',
        width: '100vw',
        position: 'relative',
        fontFamily: 'Inter, system-ui, sans-serif',
        background: 'linear-gradient(120deg, #e0f2fe 0%, #f8fafc 100%)',
        overflow: 'auto'
      }}>
        {/* Abstract SVG background */}
        <svg width="100%" height="100%" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 0,
          pointerEvents: 'none'
        }} viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fill="#e0f2fe" fillOpacity="1" d="M0,160L60,170.7C120,181,240,203,360,197.3C480,192,600,160,720,133.3C840,107,960,85,1080,101.3C1200,117,1320,171,1380,197.3L1440,224L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
        </svg>
        <div style={{ position: 'relative', zIndex: 1 }}>
        <QueryClientProvider client={queryClient}>  
          {children}
          <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
        </QueryClientProvider>
        </div>
      </body>
    </html>
  );
}
