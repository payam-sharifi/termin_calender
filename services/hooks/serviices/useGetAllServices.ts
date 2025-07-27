//getAllServices

import { getAllServices } from "@/services/servicesApi";
import { useQuery } from "@tanstack/react-query";

export const useGetAllServices = (provide_id: string) => {
  return useQuery({
    queryKey: ["getServices"],
    queryFn: () => getAllServices(provide_id),
   
  //  refetchInterval: 60_000, // هر ۱۰ ثانیه چک کند
  });
};
