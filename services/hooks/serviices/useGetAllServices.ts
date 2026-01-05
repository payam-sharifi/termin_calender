//getAllServices

import { getAllServices } from "@/services/servicesApi";
import { useQuery } from "@tanstack/react-query";

export const useGetAllServices = (provide_id: string) => {
  return useQuery({
    queryKey: ["getServices", provide_id],
    queryFn: () => getAllServices(provide_id),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  //  refetchInterval: 60_000, // هر ۱۰ ثانیه چک کند
  });
};
