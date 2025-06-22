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
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem('termin-token') : null;
    setToken(t);

    if (!t && pathname !== "/login") {
      router.push("/auth/login");
    } else if (t && pathname === "/dashboard") {
      const decoded = jwtDecode<{ id: string }>(t);
      router.push(`/dashboard/service/${decoded.id}`);
    }
  }, [pathname, router]);

  if (token === null) {
    return <div>Loading...</div>;
  }

  return (
    <>
          {children}
    </>
 );
}
