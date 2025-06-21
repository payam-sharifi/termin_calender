import { useQuery } from "@tanstack/react-query";
import { getAllUser } from "../../userApi";

export const useGetUsers = (
  search: string,
  limit: number = 10,
  page: number = 1,
  role?: string
) => {
  return useQuery({
    queryKey: ["users", search, limit, page, role],
    queryFn: () => getAllUser(search, limit, page, role),
  //  refetchInterval: 10_000, // هر ۱۰ ثانیه چک کند
  });
};

