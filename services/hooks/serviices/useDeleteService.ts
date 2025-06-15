import { deleteServiceById } from "@/services/servicesApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useDeleteService = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (serviceId: string) => deleteServiceById(serviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getServices"] });
    },
  });
}; 