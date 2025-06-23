import api from "../axiosConfig";
import {  getTimeSlotsUpdateRsDataType, TimeSlotsRqType, TimeSlotsRqUpdateType } from "./TimeSlots.types";



export const CreateTimeSlotsApi = async (body:TimeSlotsRqType): Promise<any> => {
  const response = await api.post(
    `timeslot`,body
  );
  return response.data;
};

export const UpdateTimeSlotsApi = async (body:TimeSlotsRqUpdateType): Promise<getTimeSlotsUpdateRsDataType> => {
  const response = await api.put(
    `timeslot/${body.id}`,body
  );
  return response.data;
};

export const DeleteTimeSlotsApi = async (id: string, phone: string): Promise<getTimeSlotsUpdateRsDataType> => {
  const response = await api.delete(`timeslot/${id}/${phone}`);
  return response.data;
};