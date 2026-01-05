import api from "../axiosConfig";
import { CreateAppointmentRqDataType, getAppointmentsRqByDateAndUserId, AppointmentPaginationResponse } from "./Appointments.type";


//AllApoiintmentForUser
export const getAllAppointmentByUserIdAndDate = async (body: getAppointmentsRqByDateAndUserId): Promise<AppointmentPaginationResponse> => {
  // Map legacy userId to customer_id for backward compatibility
  const params: any = { ...body };
  if (body.userId && !body.customer_id) {
    params.customer_id = body.userId;
    delete params.userId;
  }
  
  const response = await api.get(`appointment`, {
    params
  });
  
  // Handle both old format (array) and new format (object with pagination)
  if (Array.isArray(response.data)) {
    // Legacy format - convert to new format
    return {
      data: response.data,
      pagination: {
        page: 1,
        limit: response.data.length,
        total: response.data.length,
        pages: 1,
        hasNext: false,
        hasPrev: false,
      },
    };
  }
  return response.data;
};



//CreateAppointment
export const createAppointment = async (appintmentData:CreateAppointmentRqDataType) => {
  const response = await api.post(`appointment`,appintmentData);
  return response.data;
};

