import { createNewServiceByProviderId } from "@/services/servicesApi";
import {
  createNewService,
  serviceType,
  ServiceRsDataType,
  User,
} from "@/services/servicesApi/Service.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/** Empty relation stub matching list rows until refetch replaces with full backend shape. */
const emptyUserStub: User = {
  id: "",
  name: "",
  family: "",
  email: "",
  phone: "",
  sex: "",
  is_verified: true,
};

function mapCreateResponseToListRow(
  created: Record<string, unknown>,
  fallbackProviderId: string,
): serviceType {
  return {
    id: String(created.id),
    provider_id: String(created.provider_id ?? fallbackProviderId),
    title: String(created.title ?? ""),
    user: emptyUserStub,
    duration: Number(created.duration ?? 0),
    price: Number(created.price ?? 0),
    color: String(created.color ?? "#ACB3D1"),
    description: String(created.description ?? ""),
    is_active: Boolean(created.is_active ?? true),
    timeSlots: [],
  };
}

export const useCreateNewService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: createNewService) => createNewServiceByProviderId(body),
    onSuccess: async (payload: unknown, variables) => {
      const res = payload as { data?: Record<string, unknown> };
      const created = res?.data;
      const pid = variables.provider_id;

      if (created?.id && pid) {
        const queryKey = ["getServices", pid] as const;
        queryClient.setQueryData<ServiceRsDataType>(queryKey, (previous) => {
          const prev = Array.isArray(previous) ? previous : [];
          if (prev.some((s) => s.id === created.id)) return prev;
          const row = mapCreateResponseToListRow(created, pid);
          return [...prev, row].sort((a, b) =>
            (a.title || "").localeCompare(b.title || "", "de"),
          );
        });
      }

      await queryClient.invalidateQueries({ queryKey: ["getServices"] });
      await queryClient.refetchQueries({ queryKey: ["getServices"] });
    },
  });
};
