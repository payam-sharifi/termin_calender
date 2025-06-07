import api from "../axiosConfig";
import { CreateUserRqDataType, CreateUserRsDataType } from "./User.type";

export const getAllAppointmentByDate = async () => {
  const response = await api.get(`appointment`);
  return response.data;
};

export const createUser = async (userData: CreateUserRqDataType) => {
  const response = await api.post(`appointment`, userData);
  return response.data;
};
