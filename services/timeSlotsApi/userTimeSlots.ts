import api from "../axiosConfig";
import { UserTimeSlotQuery, UserTimeSlotsResponse } from "./userTimeSlots.types";

export const getUserTimeSlots = async (
  params: UserTimeSlotQuery
): Promise<UserTimeSlotsResponse> => {
  const response = await api.get("timeslot/user/time-slots", { params });
  return response.data as UserTimeSlotsResponse;
};


