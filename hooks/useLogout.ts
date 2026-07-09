// hooks/useLogout.ts

import { useRouter } from "next/navigation";
import { clearToken } from "@/lib/authToken";

const useLogout = () => {
  const router = useRouter();

  const logout = () => {
    clearToken();
    router.push('/auth/login');
  };

  return { logout };
};

export default useLogout;