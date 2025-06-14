import api from "../axiosConfig";
import { ServiceRqType } from "../timeSlotsApi/TimeSlots.types";
import { createNewService, ServiceRsDataType } from "./Service.types";

export const getServicesByPrividerId = async (
  body: ServiceRqType
): Promise<ServiceRsDataType> => {
  const response = await api.post(`service`, body);
  return response.data;
};



export const getAllServices = async (): Promise<ServiceRsDataType> => {
  const response = await api.get(`service`);
  return response.data;
};



export const createNewServiceByProviderId = async (body:createNewService) => {
  const response = await api.post(`service/create`,body);
  return response.data;
};