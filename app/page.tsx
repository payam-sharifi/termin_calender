"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push(`/service/48a25a1b-771d-4611-a926-e929aeb4b2df`);
  }, [router]);

  return null;
}
