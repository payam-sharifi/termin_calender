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
      // Only run on client side
      if (typeof window === 'undefined') {
        setIsLoading(false);
        return;
      }

      // Check for token in localStorage
      const t = localStorage.getItem('termin-token');
      setToken(t);
   
      if(t){
        try {
          const decoded = jwtDecode<{ id: string }>(t);
          setIsUserId(decoded.id);
          // Safely set localStorage and cookie
          localStorage.setItem('termin-token', t);
          document.cookie = `termin-token=${t}; path=/; max-age=3600`; 
          //  router.push(`/service/${decoded.id}`);
        } catch (error) {
          console.error('[useDecoder] Error decoding token:', error);
          // Clear invalid token
          localStorage.removeItem('termin-token');
          setToken(null);
        }
      }

      setIsLoading(false);
    };

    checkAuth();
  }, []);

  return { userId, isLoading };
};

export default useDecoder;