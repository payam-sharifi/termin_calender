export interface TimeSlotsType {
  id: string,
  service_id: string,
  start_time: string,
  end_time: string,
  status: string,
}

export interface serviceType {
  id: string,
  provider_id: string,
  name: string,
  providerName: string,
  duration: number,
  price: number,
  description: string,
  is_active: boolean,
  timeSlots: TimeSlotsType[]
}

export type ServiceRsDataType = serviceType[];