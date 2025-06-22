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
  const {
    data: onlyServiceData,
    isError: onlyServiceError,
    isLoading: onlyServiceLoading,
  } = useGetAllServices();

  const {
    mutate: GetServices,
    data: serviceWithEventData,
    isError,
    isSuccess,
  } = useGetServicesByProviderId();

useEffect(()=>{
  GetServices({
    provider_id,
    start_time: new Date().toISOString().split("T")[0],
    end_time:  new Date().toISOString().split("T")[0],
  });
},[])

useEffect(()=>{
  if(dateSizeChange){
  GetServices({
    provider_id,
    start_time: new Date().toISOString().split("T")[0],
    end_time:  new Date().toISOString().split("T")[0],
  });
}
setDateSizeChange(false)
},[dateSizeChange])

  const handleDateRangeChange = (newStart: Date, newEnd: Date) => {
    const formatDate = (date: Date) => {
      return date.toISOString().split("T")[0];
    };
    //setDate(formatDate(newStart));

    const start_time = formatDate(newStart);
    const end_time = formatDate(newEnd);
    GetServices({
      provider_id,
      start_time,
      end_time,
    });
  };

  const transformedData = (serviceWithEventData ?? []).flatMap(
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
          providerName: service.providerName,
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
  );
  const adjEvents1 = transformedData.map((it: any, ind: any) => ({
    ...it,
    isDraggable: ind % 2 === 0,
  }));

  // if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error!</p>;

  return (
   <>
      
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
      {/* </Container> */}
      </>
  );
}
