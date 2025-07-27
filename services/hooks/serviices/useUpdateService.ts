import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateServiceById } from "@/services/servicesApi";
import { createNewService } from "@/services/servicesApi/Service.types";

export const useUpdateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<createNewService> }) =>
      updateServiceById(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getServices"] });
    },
  });
}; 