"use client";
import type { Metadata } from "next";
import "bootstrap/dist/css/bootstrap.min.css";
import { Geist, Geist_Mono } from "next/font/google";
import "react-datepicker/dist/react-datepicker.css";
import "@/resources/main.scss";
import "@/styles/appventure-theme.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.scss";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/services/queryClient";
import "bootstrap-icons/font/bootstrap-icons.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import useDecoder from "@/hooks/useDecoder";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import React from "react";
import PWAUpdatePrompt from "@/components/PWAUpdatePrompt";
import ServiceWorkerCleanup from "@/components/ServiceWorkerCleanup";
import GlobalErrorLogger from "@/components/GlobalErrorLogger";
import ChatWidget from "@/components/ChatWidget";

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
    const metaTags = [
      { name: "application-name", content: "Termin Calendar" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { name: "apple-mobile-web-app-title", content: "Termin Calendar" },
      {
        name: "description",
        content:
          "Professional appointment booking and calendar management system",
      },
      { name: "format-detection", content: "telephone=no" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "msapplication-TileColor", content: "#1c1d26" },
      { name: "msapplication-tap-highlight", content: "no" },
      { name: "theme-color", content: "#c5a059" },
    ];

    const linkTags = [
      { rel: "manifest", href: "/manifest.json" },
      { rel: "apple-touch-icon", href: "/icons/icon-192x192.png" },
    ];

    metaTags.forEach((tag) => {
      let element = document.querySelector(`meta[name="${tag.name}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute("name", tag.name);
        document.head.appendChild(element);
      }
      element.setAttribute("content", tag.content);
    });

    linkTags.forEach((tag) => {
      const selector =
        tag.rel === "manifest"
          ? 'link[rel="manifest"]'
          : `link[rel="${tag.rel}"][href="${tag.href}"]`;
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement("link");
        element.setAttribute("rel", tag.rel);
        element.setAttribute("href", tag.href);
        document.head.appendChild(element);
      }
    });

    document
      .querySelectorAll(
        'link[rel="apple-touch-startup-image"], link[rel="icon"], link[rel="shortcut icon"]',
      )
      .forEach((element) => element.remove());
  }, []);

  return (
    <html lang="en" data-bs-theme="dark" data-scroll-behavior="smooth">
      <head>
        {/* PWA Meta Tags */}
        <meta name="application-name" content="Termin Calendar" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Termin Calendar" />
        <meta
          name="description"
          content="Professional appointment booking and calendar management system"
        />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#1c1d26" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#c5a059" />

        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />

        <style jsx global>{`
          html,
          body {
            overflow-x: hidden;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
          }
          @media (max-width: 768px) {
            html,
            body {
              overflow-x: hidden;
              overflow-y: auto;
              -webkit-overflow-scrolling: touch;
            }
          }
        `}</style>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable}`}
        style={{
          minHeight: "100vh",
          width: "100vw",
          position: "relative",
          overflow: "auto",
        }}
      >
        <div style={{ position: "relative", zIndex: 1 }}>
          <QueryClientProvider client={queryClient}>
            {children}
            <ServiceWorkerCleanup />
            <GlobalErrorLogger />
            <PWAUpdatePrompt />
            <ChatWidget />
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
