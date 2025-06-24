import { updateUser } from "@/services/userApi";
import { UpdateUserRqDataType } from "@/services/userApi/user.types";
import { useMutation } from "@tanstack/react-query";

export const useUpdateUser = () => {
  return useMutation({
    mutationFn: (body: UpdateUserRqDataType) => updateUser(body),
  });
};
