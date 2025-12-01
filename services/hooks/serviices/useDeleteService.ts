import { deleteServiceById } from "@/services/servicesApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useDeleteService = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (serviceId: string) => deleteServiceById(serviceId),
    onSuccess: () => {
      // Invalidate and refetch to ensure all devices have the latest data
      queryClient.invalidateQueries({ queryKey: ["getServices"] });
      queryClient.refetchQueries({ queryKey: ["getServices"] });
    },
  });
}; 