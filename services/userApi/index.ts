import { promises } from "dns";
import api from "../axiosConfig";
import {
  CreateUserRqDataType,
  UpdateUserRqDataType,
  getAllUserRsDataType,
  UserCreateRsDataType,
  UserProfileRsDataType,
  UserRsDataType,
} from "./user.types";

export const getAllUser = async (
  search: string,
  limit?: number,
  page?: number,
  role?: string,
): Promise<getAllUserRsDataType> => {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (limit) params.append('limit', limit.toString());
  if (page) params.append('page', page.toString());
  if (role) params.append('role', role);

  const response = await api.get(`user?${params.toString()}`);
  return response.data;
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


//تایپش باید درست شود
export const createUser = async (userData: CreateUserRqDataType): Promise<UserCreateRsDataType> => {
  const response = await api.post(`user`, userData);
  return response.data;
};

export const updateUser = async (
  body: UpdateUserRqDataType
): Promise<ResponseType> => {
  const { id, ...data } = body;
  const response = await api.put(`user/${id}`, data);
  return response.data;
};

export const deleteUserById = async ({id}:{id:string}): Promise<ResponseType> => {
  const response = await api.delete(`user/${id}`,);
  return response.data;
};