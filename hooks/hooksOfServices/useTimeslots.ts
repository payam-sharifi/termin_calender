import { useQuery } from "@tanstack/react-query";
import { getAllUser } from "@/lib/api";

export const useGetServices = () => {
    return useQuery({
      queryKey: ["services"],
      queryFn: () => getAllUser(),
      refetchInterval: 10_000, // هر ۱۰ ثانیه چک کند
    });
  };