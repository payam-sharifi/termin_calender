"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const token=localStorage.getItem("termin-token")

  useEffect(() => {
    if(token){
      router.push(`/service/${token}`);
    }else{
      router.push(`/auth`);
    }
  }, [router,token]);

  return <></>
}
