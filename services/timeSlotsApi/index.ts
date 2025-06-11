import api from "../axiosConfig";
import {  TimeSlotsRqType } from "./TimeSlots.types";



export const CreateTimeSlotsApi = async (body:TimeSlotsRqType): Promise<any> => {
  const response = await api.post(
    `timeslot`,body
  );
  return response.data;
};

