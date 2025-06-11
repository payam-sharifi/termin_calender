import { Event as CalendarEvent } from "react-big-calendar";
import { seviceType } from "@/services/servicesApi/Service.types";

export interface Event extends CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  service: seviceType[];
  customerName: string;
  customerFamily: string;
  customerEmail: string;
  customerPhone: string;
  description?: string;
} 