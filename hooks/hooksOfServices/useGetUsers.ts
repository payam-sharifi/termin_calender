
import { useQuery } from "@tanstack/react-query";
import { getAllUser } from "@/lib/api";

export const useGetUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => getAllUser(),
    refetchInterval: 10_000, // هر ۱۰ ثانیه چک کند
  });
};

