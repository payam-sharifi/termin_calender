import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateServiceById } from "@/services/servicesApi";
import { createNewService } from "@/services/servicesApi/Service.types";

export const useUpdateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<createNewService> }) =>
      updateServiceById(id, data),
    onSuccess: () => {
      // Invalidate all queries that start with "getServices" to ensure all devices refetch
      queryClient.invalidateQueries({ queryKey: ["getServices"] });
      // Also refetch immediately to ensure the current device has the latest data
      queryClient.refetchQueries({ queryKey: ["getServices"] });
    },
  });
}; 