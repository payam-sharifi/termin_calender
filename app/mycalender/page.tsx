"use client";
import { useGetTimeSlotsByDate } from "@/hooks/timeSlots/useGetTimeSlots";

import {
  ScheduleRsDataType,
  TimeSlotsRsDataType,
} from "@/services/scheduleApi/TimeSlots.types";
import { useSearchParams } from "next/navigation";

import { Container } from "react-bootstrap";
import MyCalendarClient from "./components/MyCalendarClient";
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
     
        <MyCalendarClient eventsObj={adjEvents1} />
    
    </main>
  );
}
