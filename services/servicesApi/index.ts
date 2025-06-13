import api from "../axiosConfig";
import { ServiceRqType } from "../timeSlotsApi/TimeSlots.types";
import { ServiceRsDataType } from "./Service.types";

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