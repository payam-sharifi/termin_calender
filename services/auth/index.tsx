import { promises } from "dns";
import api from "../axiosConfig";

import {  LoginResponseTypeData, loginRqDataType } from "./auth.type";


//UserRsDataType

export const loginUser = async (body:loginRqDataType): Promise<LoginResponseTypeData>  => {
  const response = await api.post(`auth/login`, body);
  console.log(response,"response")
  return response.data;
};

//LoginResponseTypeData





