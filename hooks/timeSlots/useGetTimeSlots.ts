import { getTimeSlotsByDate } from "@/services/scheduleApi";
import { ScheduleRqDataType } from "@/services/scheduleApi/TimeSlots.types";
import { useQuery } from "@tanstack/react-query";

export const useGetTimeSlotsByDate = (queryParams: ScheduleRqDataType) => {
  return useQuery({
    queryKey: ["getTimeSlots"],
    queryFn: () => getTimeSlotsByDate(queryParams),
    enabled:
      !!queryParams.start_time &&
      !!queryParams.end_time &&
      !!queryParams.status,
    refetchInterval: 60_000, // هر ۱۰ ثانیه چک کند
  });
};
