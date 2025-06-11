"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useGetTimeSlotsByDate } from "@/hooks/schedule/useScheduleByDateAndProviderId";
import DnDCalender from "./DnDCalender";
import {
  ScheduleRsDataType,
  TimeSlotsRsDataType,
} from "@/services/scheduleApi/Schedule.types";
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
function CalenderContent() {
  const searchParams = useSearchParams();
  const start_time =
    searchParams.get("start_time") || startDefault.toISOString();
  const end_time = searchParams.get("end_time") || endDefault.toISOString();
  const status = searchParams.get("status") || "true";
  // const params = new URLSearchParams({
  //     start_time: '2025-06-10',
  //     status: 'Available',
  //   });

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
  // CalenderType
  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading data.</p>;

  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Calendar</h1>
      <DnDCalender data={transformedData}/>
    </>
  );
}

export default function CalenderClient() {
  return (
    <Suspense fallback={<p>Loading calendar...</p>}>
      <CalenderContent />
    </Suspense>
  );
}
