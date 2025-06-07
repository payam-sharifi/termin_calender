import { getAllAppointmentByDate } from "@/services/appointmentApi";
import { useQuery } from "@tanstack/react-query";

export const useGetAllAppintmentsByDate = () => {
  return useQuery({
    queryKey: ["getAppointments"],
    queryFn: () => getAllAppointmentByDate(),
    refetchInterval: 10_000, // هر ۱۰ ثانیه چک کند
  });
};
