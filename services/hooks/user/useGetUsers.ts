import { useQuery } from "@tanstack/react-query";
import { getAllUser } from "../../userApi";

export const useGetUsers = (
  search: string,
  limit: number = 10,
  page: number = 1,
  provider_id: string,
  role?: string
) => {
  return useQuery({
    queryKey: ["users", search, limit, page, provider_id, role],
    queryFn: () => getAllUser(search, limit, page, provider_id, role),
  //  refetchInterval: 10_000, // هر ۱۰ ثانیه چک کند
  });
};

