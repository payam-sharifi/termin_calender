

import { CreateTimeSlotsApi } from "@/services/timeSlotsApi";
import { TimeSlotsRqType } from "@/services/timeSlotsApi/TimeSlots.types";
import { useMutation } from "@tanstack/react-query";


export const useCreateTimeSlot = () => {
  return useMutation({
  // queryKey: ["createTimeSlots"],
    mutationFn: (body:TimeSlotsRqType) => CreateTimeSlotsApi(body),
    //refetchInterval: 10_000, // هر ۱۰ ثانیه چک کند
  });
};
