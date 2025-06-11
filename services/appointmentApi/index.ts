import api from "../axiosConfig";
import { CreateAppointmentRqDataType, getAppointmentsRqByDateAndUserId } from "./Appointments.type";


//AllApoiintmentForUser
export const getAllAppointmentByUserIdAndDate = async (body:getAppointmentsRqByDateAndUserId) => {
  const response = await api.get(`appointment`,{
    params:body
  });
  return response.data;
};



//CreateAppointment
export const createAppointment = async (appintmentData:CreateAppointmentRqDataType) => {
  const response = await api.post(`appointment`,appintmentData);
  return response.data;
};

