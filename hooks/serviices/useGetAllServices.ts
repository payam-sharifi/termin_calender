//getAllServices

import { getAllServices } from "@/services/servicesApi";
import { useQuery } from "@tanstack/react-query";

export const useGetAllServices = () => {
  return useQuery({
    queryKey: ["getServices"],
    queryFn: () => getAllServices(),
   
  //  refetchInterval: 60_000, // هر ۱۰ ثانیه چک کند
  });
};
