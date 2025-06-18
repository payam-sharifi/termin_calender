
import { useQuery } from "@tanstack/react-query";
import { getAllUser } from "../../userApi";


export const useGetUsers = (role?:string) => {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => getAllUser(role),
  //  refetchInterval: 10_000, // هر ۱۰ ثانیه چک کند
  });
};

