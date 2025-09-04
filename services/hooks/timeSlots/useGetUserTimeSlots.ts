import { useQuery } from "@tanstack/react-query";
import { getUserTimeSlots } from "@/services/timeSlotsApi/userTimeSlots";
import { UserTimeSlotQuery } from "@/services/timeSlotsApi/userTimeSlots.types";

export const useGetUserTimeSlots = (params: UserTimeSlotQuery) => {
  return useQuery({
    queryKey: ["user-time-slots", params],
    queryFn: () => getUserTimeSlots(params),
    keepPreviousData: true,
  });
};


