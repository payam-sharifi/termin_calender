import { getTimeSlotsByDate } from "@/services/timeSlotsApi";
import { TimeSlotsRqDataType } from "@/services/timeSlotsApi/TimeSlots.types";
import { useQuery } from "@tanstack/react-query";

export const useGetTimeSlotsByDate = (queryParams: TimeSlotsRqDataType) => {
  return useQuery({
    queryKey: ["getTimeSlots"],
    queryFn: () => getTimeSlotsByDate(queryParams),
    enabled:
      !!queryParams.start_time &&
      !!queryParams.end_time &&
      !!queryParams.status,
    refetchInterval: 10_000, // هر ۱۰ ثانیه چک کند
  });
};
