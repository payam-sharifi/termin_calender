"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useGetTimeSlotsByDate } from "@/hooks/timeSlots/useGetTimeSlots";
import DnDCalender from "./DnDCalender";
import { STATUS } from "@/services/timeSlotsApi/TimeSlots.types";
const today = new Date();
const startDefault = new Date(
  today.getFullYear(),
  today.getMonth(),
  today.getDate(),  
);
const endDefault = new Date(
  today.getFullYear(),
  today.getMonth(),
  today.getDate()+1,
);
function CalenderContent() {
  const searchParams = useSearchParams();
  const start_time = searchParams.get("start_time") || startDefault.toISOString();
  const end_time = searchParams.get("end_time") || endDefault.toISOString();
  const status = searchParams.get("status") || STATUS.Available;
  // const params = new URLSearchParams({
  //     start_time: '2025-06-10',
  //     status: 'Available',
  //   });
  
  const { data, isLoading, error } = useGetTimeSlotsByDate({
    start_time,
    end_time,
    status,
  });


  // CalenderType
  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading data.</p>;

  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Calendar</h1>
      <DnDCalender events={data}/>
    </>
  );
}

export default function CalenderClient() {
  return (
    <Suspense fallback={<p>Loading calendar...</p>}>
      <CalenderContent  />
    </Suspense>
  );
}
