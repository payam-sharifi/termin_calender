

import {  sendOtp } from "@/services/auth";
import { useMutation } from "@tanstack/react-query";


export const useSendOtp = () => {
  return useMutation({
  // queryKey: ["createTimeSlots"],
    mutationFn: (phone:{phone:string}) => sendOtp(phone),
    //refetchInterval: 10_000, // هر ۱۰ ثانیه چک کند
  });
};
