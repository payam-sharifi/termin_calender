import { promises } from "dns";
import api from "../axiosConfig";

import {  LoginResponseTypeData, loginRqDataType, registerUserRqType } from "./auth.type";


//UserRsDataType

export const loginUser = async (body:loginRqDataType): Promise<LoginResponseTypeData>  => {
  const response = await api.post(`auth/login`, body);

  return response.data;
};

//LoginResponseTypeData

export const sendOtp = async (phone:{phone:string}): Promise<LoginResponseTypeData>  => {
  const response = await api.post(`auth/send-otp`, phone);

  return response.data;
};


export const register = async (body:registerUserRqType): Promise<LoginResponseTypeData>  => {
  const response = await api.post(`auth/register`, body);
  return response.data;
};


