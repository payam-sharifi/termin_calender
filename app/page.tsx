"use client";
import { useGetTimeSlotsByDate } from "@/hooks/timeSlots/useGetTimeSlots";

import {
  ScheduleRsDataType,
  TimeSlotsRsDataType,
} from "@/services/scheduleApi/TimeSlots.types";
import { useSearchParams } from "next/navigation";
import MyCalendarClient from "./mycalender/components/MyCalendarClient";
import { Container } from "react-bootstrap";
import { useGetOneUser } from "@/hooks/user/useGetOneuser";
import { useGetServicesByUserId } from "@/hooks/serviices/useGetServices";
import { useEffect, useState } from "react";
import { ServiceRsDataType } from "@/services/servicesApi/Service.types";
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
  const { data: userData,isLoading:userisLoading,error:userError} = useGetOneUser({id:"123e9fae-4825-4e11-9d2e-9d41510adbe7"});
  //useGetServicesByUserId
//  const { data: serviceData,isLoading:serviceisLoading,error:serviceError} = useGetServicesByUserId({userId:"123e9fae-4825-4e11-9d2e-9d41510adbe7"});

useEffect(()=>{

},[userData])
  const {
    data: apiData,
    isLoading,
    error,
  } = useGetTimeSlotsByDate({
    start_time,
    end_time,
    status,
  });

  const transformedData: CustomEvent[] = (apiData ?? []).flatMap(
    (schedule: ScheduleRsDataType) =>
      schedule.timeSlot.map((slot: TimeSlotsRsDataType, index: number) => ({
        start: new Date(slot.start_time),
        end: new Date(slot.end_time),
        id: index + 1,
        slotId: slot.id,
        isDraggable: true,
        title: "test",
      }))
  );

  const adjEvents1 = transformedData.map((it: any, ind: any) => ({
    ...it,
    isDraggable: ind % 2 === 0,
  }));

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error!</p>;
  return (
    <main className="p-4">
      {/*  // <h1 className="text-2xl font-bold mb-4">ٍCalendar</h1> */}
      <Container className="m-4" >
        
        <MyCalendarClient eventsObj={adjEvents1} services={userData?.service!} />
      </Container>
    </main>
  );
}
