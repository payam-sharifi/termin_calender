import { promises } from "dns";
import api from "../axiosConfig";
import { CreateUserRqDataType, getAllUserRsDataType, UserRsDataType } from "./user.types";



export const getAllUser = async (): Promise<getAllUserRsDataType>  => {
  const response = await api.get(`user`);
  return response.data;
};

export const getOneUser = async ({id}:{id:string}): Promise<UserRsDataType> =>{
  const response = await api.get(`user/${id}`);
  return response.data;
};
//UserRsDataType

export const createUser = async (userData: CreateUserRqDataType) => {
  const response = await api.post(`user`, userData);
  return response.data;
};


