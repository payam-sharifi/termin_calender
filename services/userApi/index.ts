import api from "../axiosConfig";
import { CreateUserRqDataType } from "./user.types";



export const getAllUser = async () => {
  const response = await api.get(`user`);
  return response.data;
};

export const createUser = async (userData: CreateUserRqDataType) => {
  const response = await api.post(`user`, userData);
  return response.data;
};
