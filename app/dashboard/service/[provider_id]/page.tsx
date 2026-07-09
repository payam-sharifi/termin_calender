"use client";

import { useGetServicesByProviderId } from "@/services/hooks/serviices/useGetServices";
import { use, useCallback, useEffect, useState } from "react";
import { useGetAllServices } from "@/services/hooks/serviices/useGetAllServices";
import { useGetOneUser } from "@/services/hooks/user/useGetOneuser";
import MyCalendarClient from "@/components/MyCalendarClient";
import {
  CALENDAR_APPOINTMENT_CREATED_EVENT,
  type CalendarAppointmentCreatedDetail,
} from "@/lib/calendarEvents";
import {
  isoToCalendarDate,
  todayYmdInAppTimezone,
  toYmdInAppTimezone,
} from "@/lib/appTimezone";
import { isPastAppointmentVisible } from "@/lib/appointmentVisibility";

export default function ServicePage({
  params,
}: {
  params: Promise<{ provider_id: string }>;
}) {
  const { provider_id } = use(params);
  const {data:userData}=useGetOneUser( {id:provider_id})
const [dateSizeChange,setDateSizeChange]=useState<boolean>(false)

const today = todayYmdInAppTimezone();
const [currentRange, setCurrentRange] = useState<{start:string,end:string}>({start: today, end: today})
  const {
    data: onlyServiceData,
    isError: onlyServiceError,
    isLoading: onlyServiceLoading,
  } = useGetAllServices(provider_id);

  const {
    mutate: GetServices,
    data: serviceWithEventData,
    isError,
    isSuccess,
  } = useGetServicesByProviderId();

useEffect(()=>{
  GetServices({
    provider_id,
    start_time: today,
    end_time:  today,
  });
  setCurrentRange({start: today, end: today})
},[])

useEffect(()=>{
  if(dateSizeChange){
  GetServices({
    provider_id,
    start_time: currentRange.start,
    end_time:  currentRange.end,
  });
  setDateSizeChange(false)
}
},[dateSizeChange, currentRange, GetServices, provider_id])

  const refetchCalendarForCurrentRange = useCallback(() => {
    GetServices({
      provider_id,
      start_time: currentRange.start,
      end_time: currentRange.end,
    });
  }, [GetServices, provider_id, currentRange.start, currentRange.end]);

  useEffect(() => {
    const onAppointmentCreated = (ev: Event) => {
      const e = ev as CustomEvent<CalendarAppointmentCreatedDetail>;
      const pid = e.detail?.providerId;
      if (!pid || pid !== provider_id) return;
      refetchCalendarForCurrentRange();
    };
    window.addEventListener(CALENDAR_APPOINTMENT_CREATED_EVENT, onAppointmentCreated);
    return () =>
      window.removeEventListener(
        CALENDAR_APPOINTMENT_CREATED_EVENT,
        onAppointmentCreated,
      );
  }, [provider_id, refetchCalendarForCurrentRange]);

  const handleDateRangeChange = (newStart: Date, newEnd: Date) => {
    const start_time = toYmdInAppTimezone(newStart);
    const end_time = toYmdInAppTimezone(newEnd);
    GetServices({
      provider_id,
      start_time,
      end_time,
    });
    setCurrentRange({start: start_time, end: end_time})
  };

  // Only transform data if we have valid serviceWithEventData
  // If undefined, don't pass empty array - let the calendar keep current events
  const transformedData = serviceWithEventData 
    ? serviceWithEventData.flatMap(
    (service, serviceIndex) =>
      service.timeSlots.map((slot, slotIndex) => {
        // For self-reservation service, use desc (title) instead of service.title
        const isSelfReservationService = service.title?.startsWith("___SELF_RESERVATION___") || false;
        const eventTitle = isSelfReservationService && slot.desc ? slot.desc : (service.title || "");
        // Use different color for self-reservation (purple/violet)
        const eventColor = isSelfReservationService ? "#9B59B6" : service.color;
        
        return {
          start: isoToCalendarDate(slot.start_time),
          end: isoToCalendarDate(slot.end_time),
          id: `${serviceIndex}-${slotIndex}`,
          slotId: slot.id,
          isDraggable: true,
          color: eventColor,
          title: eventTitle,
          service: {
            id: service.id,
            provider_id: service.provider_id,
            name: service.title,
            providerName: service.user?.name || '',
            duration: service.duration,
            price: service.price,
            description: service.description,
            is_active: service.is_active,
            timeSlots: service.timeSlots,
          },
          customerName: isSelfReservationService ? "Selbst" : (slot.user?.name || ""),
          customerFamily: isSelfReservationService ? "" : (slot.user?.family || ""),
          customerEmail: isSelfReservationService ? "" : (slot.user?.email || ""),
          customerPhone: isSelfReservationService ? "" : (slot.user?.phone || ""),
          description: slot.desc || "", // Add description from slot.desc for display in EventDetailsModal
          desc: slot.desc,
          isSelfReservation: isSelfReservationService,
        };
      })
      ).filter((event) => isPastAppointmentVisible(event.start))
    : undefined; // Pass undefined during loading, not empty array
  
  const adjEvents1 = transformedData 
    ? transformedData.map((it: any, ind: any) => ({
    ...it,
    isDraggable: ind % 2 === 0,
      }))
    : undefined; // Pass undefined during loading

  // if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error!</p>;

  return (
   <>
      <div>
      {/* <Container className="m-4"> */}
      <MyCalendarClient
      change={()=>setDateSizeChange(true)}
        eventsObj={adjEvents1}
        userProfileData={userData?.data}
        services={onlyServiceData ?? []}
        provider_id={provider_id}
        onDateRangeChange={(newDate, end_time) => {
          handleDateRangeChange(newDate, end_time);
        }}
      />
      </div>
      {/* </Container> */}
      </>
  );
}
