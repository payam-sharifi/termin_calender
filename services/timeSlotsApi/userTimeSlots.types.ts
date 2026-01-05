export interface UserTimeSlotQuery {
  user_id: string;
  page?: number;
  limit?: number;
  start_time?: string; // ISO
  end_time?: string;   // ISO
}

export interface ServiceInfo {
  id: string;
  title: string;
  duration: number;
  price: number;
  color?: string;
  description?: string;
}

export interface UserTimeSlotItem {
  id: string;
  service_id: string;
  start_time: string;
  end_time: string;
  status: string;
  customer_id: string;
  desc?: string;
  reminderSent?: boolean;
  service?: ServiceInfo;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface UserTimeSlotsResponse {
  statusCode: number;
  message: string;
  data: UserTimeSlotItem[];
  pagination: PaginationMeta;
}


