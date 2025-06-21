import { createUser } from "@/services/userApi";
import { CreateUserRqDataType } from "@/services/userApi/user.types";
import { useMutation } from "@tanstack/react-query";

export const useCreateUser = () => {
  return useMutation({
    mutationFn: (body: CreateUserRqDataType) => createUser(body),
  });
}; 