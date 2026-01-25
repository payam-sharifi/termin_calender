"use client";


import { useRouter } from "next/navigation";

import { useEffect } from "react";


export default function Home() {
const router=useRouter()
useEffect(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (let registration of registrations) {
        registration.unregister();
        console.log('Service Worker unregistered');
      }
    });
  }
}, []);

useEffect(()=>{


  router.push(`/dashboard`)

},[])

  return (
    <>
    </>
  );
}
