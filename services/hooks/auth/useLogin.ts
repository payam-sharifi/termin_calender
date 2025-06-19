

import { loginUser } from "@/services/auth";
import { loginRqDataType } from "@/services/auth/auth.type";
import { useMutation } from "@tanstack/react-query";


export const useLogin = () => {
  return useMutation({
  // queryKey: ["createTimeSlots"],
    mutationFn: (body:loginRqDataType) => loginUser(body),
    //refetchInterval: 10_000, // هر ۱۰ ثانیه چک کند
  });
};
