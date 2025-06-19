import { useQuery } from "@tanstack/react-query";
import { getAllUser } from "../../userApi";

export const useGetUsers = (role?: string, limit: number = 10, page: number = 1) => {
  return useQuery({
    queryKey: ["users", role, limit, page],
    queryFn: () => getAllUser(role, limit, page),
  //  refetchInterval: 10_000, // هر ۱۰ ثانیه چک کند
  });
};

