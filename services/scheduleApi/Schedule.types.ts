export enum STATUS {
  Available = "Available",
  Booked = "Booked",
  Cancelled = "Cancelled",
}


export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  desc: string;
}

export interface TimeSlotsRsDataType {
  id: string;
  schedule_id: string;
  start_time: string;
  end_time: string;
  status: string;
}

export interface ScheduleRsDataType {
  id: string;
  provider_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  is_available: string;
  timeSlot: TimeSlotsRsDataType[];
}
export interface ScheduleRqDataType {
  start_time: string;
  end_time: string;
  is_available?: string;
  provider_id?:string
}
export type CalendarType = CalendarEvent[];
