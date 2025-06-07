export enum STATUS {
  Available = "Available",
  Booked = "Booked",
  Cancelled = "Cancelled",
}

export interface TimeSlotsRqDataType {
  start_time: string;
  end_time: string;
  status: string;
}
export interface CalenderType {
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
