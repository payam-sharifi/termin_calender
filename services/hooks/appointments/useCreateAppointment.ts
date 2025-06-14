import { createAppointment } from "@/services/appointmentApi";
import { CreateAppointmentRqDataType } from "@/services/appointmentApi/Appointments.type";
import { useQuery } from "@tanstack/react-query";

export const useCreateAppointment = ({appintmentData}:{appintmentData:CreateAppointmentRqDataType}) => {
  return useQuery({
    queryKey: ["createAppointments"],
    queryFn: () => createAppointment(appintmentData),
    //refetchInterval: 10_000, // هر ۱۰ ثانیه چک کند
  });
};
