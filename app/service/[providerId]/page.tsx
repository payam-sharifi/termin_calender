"use client";

import { useSearchParams, useRouter } from "next/navigation";
import MyCalendarClient from "@/app/mycalender/components/MyCalendarClient";
import { Container } from "react-bootstrap";
import { useGetServicesByProviderId } from "@/hooks/serviices/useGetServices";
import { useState } from "react";
import { ServiceRsDataType } from "@/services/servicesApi/Service.types";
import { use } from "react";

const today = new Date();

export default function ServicePage({
  params,
}: {
  params: Promise<{ providerId: string }>;
}) {
  const today = new Date();
  const yyyyMMdd = today.toISOString().split("T")[0];
  const { providerId } = use(params);
  const searchParams = useSearchParams();
  const [date, setDate] = useState<string>();

  const {
    mutate: GetServices,
    data: serviceData,
    isError,
    isSuccess,
  } = useGetServicesByProviderId();


  // const {
  //   data: serviceData,
  //   isLoading,
  //   error,
  //   refetch,
  // } = useGetServicesByProviderId({
  //   providerId,
  //   start_time: date ? date : yyyyMMdd,
  //   end_time: date ? date : yyyyMMdd,
  // });

  const handleDateRangeChange = (newStart: Date, newEnd: Date) => {
    console.log(newStart, "newStart");

    const formatDate = (date: Date) => {
      return date.toISOString().split("T")[0];
    };
    //setDate(formatDate(newStart));

    const start_time = formatDate(newStart);
    const end_time = formatDate(newEnd);
    GetServices({
      providerId,
      start_time,
      end_time,
    });
  
  };

  const transformedData = (serviceData ?? []).flatMap((service, serviceIndex) =>
    service.timeSlots.map((slot, slotIndex) => ({
      start: new Date(slot.start_time),
      end: new Date(slot.end_time),
      id: `${serviceIndex}-${slotIndex}`,
      slotId: slot.id,
      isDraggable: true,
      title: service.name,
      service: {
        id: service.id,
        provider_id: service.provider_id,
        name: service.name,
        providerName: service.providerName,
        duration: service.duration,
        price: service.price,
        description: service.description,
        is_active: service.is_active,
        timeSlots: service.timeSlots,
      },
      customerName: "",
      customerFamily: "",
      customerEmail: "",
      customerPhone: "",
    }))
  );

  const adjEvents1 = transformedData.map((it: any, ind: any) => ({
    ...it,
    isDraggable: ind % 2 === 0,
  }));

 // if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error!</p>;

  return (
    <main className="p-4">
      <Container className="m-4">
        <MyCalendarClient
          eventsObj={adjEvents1}
          services={serviceData ?? []}
          onDateRangeChange={(newDate, end_time) => {
            handleDateRangeChange(newDate, end_time);
     
          }}
        />
      </Container>
    </main>
  );
}
