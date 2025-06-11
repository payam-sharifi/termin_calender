
import { getServicesByPrividerId } from "@/services/servicesApi";
import { useQuery } from "@tanstack/react-query";

export const useGetServicesByProviderId = ({providerId}:{providerId:string}) => {
  return useQuery({
    queryKey: ["getServices"],
    queryFn: () => getServicesByPrividerId({providerId}),
   refetchInterval: 10_000, // هر ۱۰ ثانیه چک کند
  });
};
