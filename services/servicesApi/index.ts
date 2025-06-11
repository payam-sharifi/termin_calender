import api from "../axiosConfig";
import { ServiceRsDataType } from "./Service.types";



export const getServicesByPrividerId = async ({providerId}:{providerId:string}): Promise<ServiceRsDataType> => {
  const response = await api.get(
    `service/${providerId}`
  );
  return response.data;
};
