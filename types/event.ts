import { Event as CalendarEvent } from "react-big-calendar";
import { serviceType } from "@/services/servicesApi/Service.types";

export interface Event extends CalendarEvent {
  id: number;
  slotId?: string;
  title: string;
  start: Date;
  end: Date;
  color?:string
  service: serviceType;
  customerName: string;
  customerFamily: string;
  customerEmail: string;
  customerPhone: string;
  customer_id: string;
  description?: string;
  sex?: string;
} 