import { ServiceRsDataType } from "../servicesApi/Service.types";

export enum ROLE {
  "Admin",
  "Customer",
  "Provider",
}

export enum SEX {
  "male",
  "female",
}

export interface UserRsDataType {
  created_at: string;
  email: string;
  family: string;
  id: string;
  is_verified: boolean;
  name: string;
  password: string;
  phone: string;
  role: ROLE;
  service:ServiceRsDataType
  sex: SEX;
  updated_at: string;
}

export interface CreateUserRqDataType {
  email: string;
  family: string;
  is_verified: boolean;
  name: string;
  password: string;
  phone: string;
  role: ROLE;
  sex: SEX;
}

export type getAllUserRsDataType = {
  success: boolean;
  data: UserRsDataType[];
  message: string;
};