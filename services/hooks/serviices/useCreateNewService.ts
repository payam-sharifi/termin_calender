import { createNewServiceByProviderId } from "@/services/servicesApi";
import { createNewService } from "@/services/servicesApi/Service.types";
import { useMutation } from "@tanstack/react-query";


export const useCreateNewService = () => {
  return useMutation({
  // queryKey: ["createTimeSlots"],
    mutationFn: (body:createNewService) => createNewServiceByProviderId(body),
    //refetchInterval: 10_000, // هر ۱۰ ثانیه چک کند
  });
};
