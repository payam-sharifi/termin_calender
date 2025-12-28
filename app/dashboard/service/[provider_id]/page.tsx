"use client";

import { useGetServicesByProviderId } from "@/services/hooks/serviices/useGetServices";
import { use, useEffect, useState } from "react";
import { useGetAllServices } from "@/services/hooks/serviices/useGetAllServices";
import { useGetOneUser } from "@/services/hooks/user/useGetOneuser";
import MyCalendarClient from "@/app/mycalender/components/MyCalendarClient";

export default function ServicePage({
  params,
}: {
  params: Promise<{ provider_id: string }>;
}) {
  const { provider_id } = use(params);
  const {data:userData}=useGetOneUser( {id:provider_id})
const [dateSizeChange,setDateSizeChange]=useState<boolean>(false)

// Track the currently viewed date range to refetch accurately after mutations
// Use local date, not UTC, to avoid timezone issues around midnight
const getLocalDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
const today = getLocalDateString(new Date());
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

  const handleDateRangeChange = (newStart: Date, newEnd: Date) => {
    // Format date using local time, not UTC, to avoid timezone issues around midnight
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const start_time = formatDate(newStart);
    const end_time = formatDate(newEnd);
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
          service.timeSlots.map((slot, slotIndex) => ({
            start: new Date(slot.start_time),
            end: new Date(slot.end_time),
            id: `${serviceIndex}-${slotIndex}`,
            slotId: slot.id,
            isDraggable: true,
            color: service.color,
            title: service.title,
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
            customerName: slot.user?.name,
            customerFamily: slot.user?.family,
            customerEmail: slot.user?.email,
            customerPhone: slot.user?.phone,
          }))
      )
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
