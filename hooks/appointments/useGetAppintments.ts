
import { getAllAppointmentByUserIdAndDate } from "@/services/appointmentApi";
import { getAppointmentsRqByDateAndUserId } from "@/services/appointmentApi/Appointments.type";
import { useQuery } from "@tanstack/react-query";

export const useGetAllAppintmentsByDateAndUserId = (body:getAppointmentsRqByDateAndUserId) => {
  return useQuery({
    queryKey: ["getAppointments"],
    queryFn: () => getAllAppointmentByUserIdAndDate(body),
   // refetchInterval: 10_000, // هر ۱۰ ثانیه چک کند
  });
};
