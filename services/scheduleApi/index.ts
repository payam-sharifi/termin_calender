import api from "../axiosConfig";
import { ScheduleRqDataType } from "./TimeSlots.types";

export const getTimeSlotsByDate = async ({
  start_time,
  end_time,
  status,
}: ScheduleRqDataType) => {
  const response = await api.get(
    `schedule?start_time=${start_time}&end_time=${end_time}&is_available=${status}`
  );
  return response.data;
};
