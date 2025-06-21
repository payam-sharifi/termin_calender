//deleteUserById





import { deleteUserById } from "@/services/userApi";
import { useMutation } from "@tanstack/react-query";


export const useDeleteUserById
 = () => {
  return useMutation({
  // queryKey: ["createTimeSlots"],
    mutationFn: (id:{id:string}) => deleteUserById(id),
    //refetchInterval: 10_000, // هر ۱۰ ثانیه چک کند
  });
};
