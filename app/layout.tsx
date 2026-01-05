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
import PWAUpdatePrompt from "@/components/PWAUpdatePrompt";

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
  // Add PWA meta tags via useEffect since this is a client component
  useEffect(() => {
    // Add PWA meta tags to head
    const metaTags = [
      { name: "application-name", content: "Termin Calendar" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { name: "apple-mobile-web-app-title", content: "Termin Calendar" },
      { name: "description", content: "Professional appointment booking and calendar management system" },
      { name: "format-detection", content: "telephone=no" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "msapplication-TileColor", content: "#0ea5e9" },
      { name: "msapplication-tap-highlight", content: "no" },
      { name: "theme-color", content: "#0ea5e9" },
    ];

    const linkTags = [
      { rel: "apple-touch-icon", href: "/icons/icon-192x192.png" },
      { rel: "icon", type: "image/png", sizes: "192x192", href: "/icons/icon-192x192.png" },
      { rel: "icon", type: "image/png", sizes: "512x512", href: "/icons/icon-512x512.png" },
      { rel: "manifest", href: "/manifest.json" },
      { rel: "shortcut icon", href: "/icons/icon-192x192.png" },
    ];

    // Add meta tags
    metaTags.forEach((tag) => {
      let element = document.querySelector(`meta[name="${tag.name}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute("name", tag.name);
        document.head.appendChild(element);
      }
      element.setAttribute("content", tag.content);
    });

    // Add link tags
    linkTags.forEach((tag) => {
      const selector = tag.rel === "manifest" 
        ? 'link[rel="manifest"]'
        : `link[rel="${tag.rel}"][href="${tag.href}"]`;
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement("link");
        Object.entries(tag).forEach(([key, value]) => {
          if (key !== "rel" || value !== "shortcut icon") {
            if (element) {
              element.setAttribute(key, value as string);
            }
          }
        });
        if (tag.rel === "shortcut icon" && element) {
          element.setAttribute("rel", "icon");
        }
        if (element) {
          document.head.appendChild(element);
        }
      }
    });

    // Add Apple touch startup images for iOS
    const appleTouchStartupImages = [
      { media: "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)", href: "/icons/apple-splash-640-1136.png" },
      { media: "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)", href: "/icons/apple-splash-750-1334.png" },
      { media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)", href: "/icons/apple-splash-828-1792.png" },
      { media: "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)", href: "/icons/apple-splash-1125-2436.png" },
      { media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)", href: "/icons/apple-splash-1242-2688.png" },
      { media: "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)", href: "/icons/apple-splash-1170-2532.png" },
      { media: "(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)", href: "/icons/apple-splash-1284-2778.png" },
    ];

    appleTouchStartupImages.forEach((img) => {
      let element = document.querySelector(`link[rel="apple-touch-startup-image"][media="${img.media}"]`);
      if (!element) {
        element = document.createElement("link");
        element.setAttribute("rel", "apple-touch-startup-image");
        element.setAttribute("media", img.media);
        element.setAttribute("href", img.href);
        document.head.appendChild(element);
      }
    });
  }, []);

  return (
    <html lang="en">
      <head>
        {/* PWA Meta Tags */}
        <meta name="application-name" content="Termin Calendar" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Termin Calendar" />
        <meta name="description" content="Professional appointment booking and calendar management system" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#0ea5e9" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#0ea5e9" />
        
        {/* PWA Icons */}
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icons/icon-512x512.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="shortcut icon" href="/icons/icon-192x192.png" />
        
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
          <PWAUpdatePrompt />
          <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
        style={{ zIndex: 9999 }}
        toastStyle={{ zIndex: 9999 }}
      />
        </QueryClientProvider>
        </div>
      </body>
    </html>
  );
}
