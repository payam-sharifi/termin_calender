"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(true);

  useEffect(() => {
    router.push(`/dashboard`);
    // Give a small delay to show loading state
    const timer = setTimeout(() => {
      setIsRedirecting(false);
    }, 100);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="termin-loading-screen">
      {isRedirecting && (
        <div style={{ textAlign: 'center' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="termin-loading-text" style={{ marginTop: '1rem' }}>در حال بارگذاری...</p>
        </div>
      )}
    </div>
  );
}
