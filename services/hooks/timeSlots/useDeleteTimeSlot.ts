

import {  DeleteTimeSlotsApi } from "@/services/timeSlotsApi";
import { useMutation } from "@tanstack/react-query";


export const useDeleteTimeSlotById = () => {
  return useMutation({
  // queryKey: ["createTimeSlots"],
    mutationFn: ({id}:{id:string}) => DeleteTimeSlotsApi(id),
    //refetchInterval: 10_000, // هر ۱۰ ثانیه چک کند
  });
};