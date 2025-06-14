
import { useQuery } from "@tanstack/react-query";
import {  getOneUser } from "../../userApi";


export const useGetOneUser = ({id}:{id:string}) => {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => getOneUser({id}),
  //  refetchInterval: 10_000, // هر ۱۰ ثانیه چک کند
  });
};

