"use client";

import {
  ScheduleRsDataType,
  TimeSlotsRsDataType,
} from "@/services/scheduleApi/Schedule.types";
import { useSearchParams } from "next/navigation";
import MyCalendarClient from "./mycalender/components/MyCalendarClient";
import { Container } from "react-bootstrap";
import { useGetOneUser } from "@/hooks/user/useGetOneuser";
import { useGetServicesByProviderId } from "@/hooks/serviices/useGetServices";
import { useEffect, useState } from "react";
import { ServiceRsDataType } from "@/services/servicesApi/Service.types";
import { useScheduleByDateAndProviderId } from "@/hooks/schedule/useScheduleByDateAndProviderId";
const today = new Date();
const startDefault = new Date(
  today.getFullYear(),
  today.getMonth(),
  today.getDate()
);
const endDefault = new Date(
  today.getFullYear(),
  today.getMonth(),
  today.getDate() + 1
);
export default function Home() {
  const searchParams = useSearchParams();
  const start_time =
    searchParams.get("start_time") || startDefault.toISOString();
  const end_time = searchParams.get("end_time") || endDefault.toISOString();
  const status = searchParams.get("status") || "true";
//const [serviceData,setServiceData]=useState<ServiceRsDataType>()
  //const { data: userData,isLoading:userisLoading,error:userError} = useGetOneUser({id:"123e9fae-4825-4e11-9d2e-9d41510adbe7"});
  //useGetServicesByProviderId
  const { data: serviceData,isLoading:serviceisLoading,error:serviceError} = useGetServicesByProviderId({providerId:"123e9fae-4825-4e11-9d2e-9d41510adbe7"});


  // const {
  //   data: apiData,
  //   isLoading,
  //   error,
  // } = useScheduleByDateAndProviderId({
  //   provider_id:"123e9fae-4825-4e11-9d2e-9d41510adbe7",
  //   start_time:"2025-08-01T09:00:00.000Z",
  //   end_time:"2025-08-01T13:30:00.000Z",
  //   is_available:"true",
  // });

 


  const transformedData = (serviceData ?? []).flatMap(
    (service, serviceIndex) =>
      service.timeSlots.map((slot, slotIndex) => ({
        start: new Date(slot.start_time),
        end: new Date(slot.end_time),
        id: `${serviceIndex}-${slotIndex}`,
        slotId: slot.id,
        isDraggable: true,
        title: service.title,
      }))
  );
  



  const adjEvents1 = transformedData.map((it: any, ind: any) => ({
    ...it,
    isDraggable: ind % 2 === 0,
  }));

  if (serviceisLoading) return <p>Loading...</p>;
  if (serviceError) return <p>Error!</p>;
  return (
    <main className="p-4">
      {/*  // <h1 className="text-2xl font-bold mb-4">ٍCalendar</h1> */}
      <Container className="m-4" >
        
        <MyCalendarClient eventsObj={adjEvents1} services={serviceData ?? []} />
      </Container>
    </main>
  );
}
