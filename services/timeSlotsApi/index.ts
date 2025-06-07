import api from "../axiosConfig";
import { TimeSlotsRqDataType } from "./TimeSlots.types";


export const getTimeSlotsByDate = async ({
  start_time,
  end_time,
  status,
}: TimeSlotsRqDataType) => {
  const response = await api.get(
    `timeslot?start_time=${start_time}&end_time=${end_time}&status=${status}`
  );
  return response.data;
};
