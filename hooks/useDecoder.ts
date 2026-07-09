// hooks/useAuth.ts
'use client'
import { jwtDecode } from 'jwt-decode';
import { useState, useEffect } from 'react';
import { getToken } from '@/lib/authToken';

const useDecoder = () => {
  const [userId, setIsUserId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const t = getToken();
    if (t) {
      try {
        const decoded = jwtDecode<{ id: string }>(t);
        setIsUserId(decoded.id);
      } catch {
        setIsUserId("");
      }
    }
    setIsLoading(false);
  }, []);

  return { userId, isLoading };
};

export default useDecoder;