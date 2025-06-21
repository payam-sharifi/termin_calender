import { ServiceRsDataType } from "../servicesApi/Service.types";

export enum ROLE {
  Admin = "Admin",
  Customer = "Customer",
  Provider = "Provider",
}

export enum SEX {
  male = "male",
  female = "female",
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
  role: string;
  sex: string;
}



export type getAllUserRsDataType = {
  success: boolean;
  data: UserRsDataType[];
  message: string;
};

export type UserProfileRsDataType = {
  success: boolean;
  data: UserRsDataType
  message: string;
};