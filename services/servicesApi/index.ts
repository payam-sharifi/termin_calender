import api from "../axiosConfig";
import { ServiceRqType } from "../timeSlotsApi/TimeSlots.types";
import { createNewService, ServiceRsDataType } from "./Service.types";

export const getServicesByPrividerId = async (
  body: ServiceRqType
): Promise<ServiceRsDataType> => {
  const response = await api.post(`service`, body);
  return response.data;
};



export const getAllServices = async (provide_id: string): Promise<ServiceRsDataType> => {
  const response = await api.get(`service/${provide_id}`);
  return response.data;
};



export const createNewServiceByProviderId = async (body:createNewService) => {
  const response = await api.post(`service/create`,body);
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