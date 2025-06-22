// hooks/useLogout.ts

import { useRouter } from "next/navigation";


const useLogout = () => {
  const router = useRouter();

  const logout = () => {
  
    localStorage.removeItem('termin-token');
  
    document.cookie = 'termin-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
   
    router.push('/auth/login');
  };

  return { logout };
};

export default useLogout;