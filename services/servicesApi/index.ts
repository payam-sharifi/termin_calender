import api from "../axiosConfig";
import { ServiceRqType } from "../timeSlotsApi/TimeSlots.types";
import { createNewService, ServiceRsDataType } from "./Service.types";

export const getServicesByPrividerId = async (
  body: ServiceRqType
): Promise<ServiceRsDataType> => {
  const response = await api.post(`service`, body);
  return response.data;
};



/** Unwrap arrays from layered API envelopes: raw array, `{ data: [...] }`, `{ data: { items: [...] } }`, etc. */
function normalizeServiceListPayload(payload: unknown): ServiceRsDataType {
  if (Array.isArray(payload)) return payload as ServiceRsDataType;
  if (!payload || typeof payload !== "object") return [];

  const tryKeys = ["data", "services", "items", "records", "rows", "list", "results"] as const;

  function walk(node: unknown, depth: number): ServiceRsDataType | undefined {
    if (depth > 10) return undefined;
    if (Array.isArray(node)) return node as ServiceRsDataType;
    if (!node || typeof node !== "object") return undefined;
    const rec = node as Record<string, unknown>;
    for (const key of tryKeys) {
      const v = rec[key];
      if (Array.isArray(v)) return v as ServiceRsDataType;
      if (v && typeof v === "object") {
        const sub = walk(v, depth + 1);
        if (sub !== undefined) return sub;
      }
    }
    return undefined;
  }

  return walk(payload, 0) ?? [];
}

export const getAllServices = async (provide_id: string): Promise<ServiceRsDataType> => {
  const response = await api.get(`service/${provide_id}`, {
    headers: {
      "Cache-Control": "no-store",
      Pragma: "no-cache",
    },
  });
  return normalizeServiceListPayload(response.data);
};



export const createNewServiceByProviderId = async (body: createNewService) => {
  const response = await api.post(`service/create`, body);
  return response.data;
};

export const deleteServiceById = async (serviceId: string) => {
  const response = await api.delete(`service/${serviceId}`);
  return response.data;
};

export const updateServiceById = async (serviceId: string, body: Partial<createNewService>) => {
  const response = await api.put(`service/${serviceId}`, body);
  return response.data;
};