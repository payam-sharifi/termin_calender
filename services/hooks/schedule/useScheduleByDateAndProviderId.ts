import { getSceduleByDateAndId } from "@/services/scheduleApi";
import { ScheduleRqDataType } from "@/services/scheduleApi/Schedule.types";
import { useQuery } from "@tanstack/react-query";

export const useScheduleByDateAndProviderId = (body: ScheduleRqDataType) => {
  return useQuery({
    queryKey: ["getSchedule"],
    queryFn: () => getSceduleByDateAndId(body),
   
    refetchInterval: 60_000, // هر ۱۰ ثانیه چک کند
  });
};
