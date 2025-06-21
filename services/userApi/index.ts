import { promises } from "dns";
import api from "../axiosConfig";
import {
  CreateUserRqDataType,
  getAllUserRsDataType,
  UserProfileRsDataType,
  UserRsDataType,
} from "./user.types";

export const getAllUser = async (role?: string,limit?:number, page?:number): Promise<getAllUserRsDataType> => {
  if (role) {
    const response = await api.get(`user?role=${role}&limit=${limit}&page=${page}`);
    return response.data;
  } else {
    const response = await api.get(`user`);
    return response.data;
  }
};

export const getOneUser = async ({
  id,
}: {
  id: string;
}): Promise<UserProfileRsDataType> => {
  const response = await api.get(`user/${id}`);
  return response.data;
};
//UserRsDataType

export const createUser = async (userData: CreateUserRqDataType) => {
  const response = await api.post(`user`, userData);
  return response.data;
};
