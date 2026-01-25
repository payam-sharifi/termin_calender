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
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      width: '100vw',
      background: 'linear-gradient(120deg, #e0f2fe 0%, #f8fafc 100%)'
    }}>
      {isRedirecting && (
        <div style={{
          textAlign: 'center',
          color: '#0ea5e9'
        }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p style={{ marginTop: '1rem', color: '#0ea5e9' }}>در حال بارگذاری...</p>
        </div>
      )}
    </div>
  );
}
