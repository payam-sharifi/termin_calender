"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const today = new Date();
  const yyyyMMdd = today.toISOString().split("T")[0];
  const router = useRouter();

  useEffect(() => {
    router.push(`/service/123e9fae-4825-4e11-9d2e-9d41510adbe7`);
  }, [router]);

  return null;
}
