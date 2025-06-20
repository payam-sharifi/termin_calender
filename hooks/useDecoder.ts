// hooks/useAuth.ts
'use client'
import { jwtDecode } from 'jwt-decode';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';


const useDecoder = () => {
  const [userId, setIsUserId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    const checkAuth = () => {
      // Check for token in localStorage
      const t = typeof window !== 'undefined' ? localStorage.getItem('termin-token') : null;
      setToken(t);
   
      if(token){
        const decoded = jwtDecode<{ id: string }>(token);
             setIsUserId(decoded.id);
            localStorage.setItem('termin-token', token);
            document.cookie = `termin-token=${token}; path=/; max-age=3600`; 

          //  router.push(`/service/${decoded.id}`);
      }

      
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  return { userId, isLoading };
};

export default useDecoder;