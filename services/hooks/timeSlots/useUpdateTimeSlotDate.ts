

import {  UpdateTimeSlotsApi } from "@/services/timeSlotsApi";
import {  TimeSlotsRqUpdateType } from "@/services/timeSlotsApi/TimeSlots.types";
import { useMutation } from "@tanstack/react-query";


export const useUpdateTimeSlotDate = () => {
  return useMutation({
  // queryKey: ["createTimeSlots"],
    mutationFn: (body:TimeSlotsRqUpdateType) => UpdateTimeSlotsApi(body),
    
    //refetchInterval: 10_000, // هر ۱۰ ثانیه چک کند
  });
};
