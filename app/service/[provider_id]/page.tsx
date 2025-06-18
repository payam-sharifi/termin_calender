"use client";

import MyCalendarClient from "@/app/mycalender/components/MyCalendarClient";
import { Container } from "react-bootstrap";
import { useGetServicesByProviderId } from "@/services/hooks/serviices/useGetServices";
import { use } from "react";
import { useGetAllServices } from "@/services/hooks/serviices/useGetAllServices";

export default function ServicePage({
  params,
}: {
  params: Promise<{ provider_id: string }>;
}) {
  const { provider_id } = use(params);

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
    <main className="p-4" style={{ backgroundColor: "#ffffff" }}>
      {/* <Container className="m-4"> */}
      <MyCalendarClient
        eventsObj={adjEvents1}
        services={onlyServiceData ?? []}
        provider_id={provider_id}
        onDateRangeChange={(newDate, end_time) => {
          handleDateRangeChange(newDate, end_time);
        }}
      />
      {/* </Container> */}
    </main>
  );
}
