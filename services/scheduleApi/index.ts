import api from "../axiosConfig";
import { ScheduleRqDataType } from "./Schedule.types";

export const getSceduleByDateAndId = async (body: ScheduleRqDataType) => {
  const response = await api.get(
    `schedule`,{params:body}
  );
  return response.data;
};
