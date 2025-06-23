import {  DeleteTimeSlotsApi } from "@/services/timeSlotsApi";
import { useMutation } from "@tanstack/react-query";


export const useDeleteTimeSlotById = () => {
  return useMutation({
  // queryKey: ["createTimeSlots"],
    mutationFn: ({ id, phone }: { id: string; phone: string }) => DeleteTimeSlotsApi(id, phone),
    //refetchInterval: 10_000, // هر ۱۰ ثانیه چک کند
  });
};