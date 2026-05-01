
import { useQuery } from "@tanstack/react-query";
import {  getOneUser } from "../../userApi";


export const useGetOneUser = ({ id }: { id: string }) => {
  return useQuery({
    queryKey: ["user", id],
    queryFn: () => getOneUser({ id }),
    enabled: Boolean(id),
  });
};

