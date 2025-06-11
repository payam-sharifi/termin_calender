import api from "../axiosConfig";
import { ServiceRsDataType } from "./Service.types";



export const getServicesByUserId = async ({userId}:{userId:string}): Promise<ServiceRsDataType> => {
  const response = await api.get(
    `service/${userId}`
  );
  return response.data;
};
