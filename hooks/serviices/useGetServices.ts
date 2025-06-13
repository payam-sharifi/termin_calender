import { getServicesByPrividerId } from "@/services/servicesApi";
import { ServiceRqType } from "@/services/timeSlotsApi/TimeSlots.types";
import { useMutation } from "@tanstack/react-query";

export const useGetServicesByProviderId = () => {
  return useMutation({
    //queryKey: ["getServices", providerId, start_time, end_time],
    mutationFn: ({provider_id,start_time,end_time}:ServiceRqType) => getServicesByPrividerId({provider_id,start_time,end_time}),
 //  refetchInterval: 10_000, // هر ۱۰ ثانیه چک کند
  });
};
