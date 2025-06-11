
import { getServicesByUserId } from "@/services/servicesApi";
import { useQuery } from "@tanstack/react-query";

export const useGetServicesByUserId = ({userId}:{userId:string}) => {
  return useQuery({
    queryKey: ["getServices"],
    queryFn: () => getServicesByUserId({userId}),
  //  refetchInterval: 10_000, // هر ۱۰ ثانیه چک کند
  });
};
