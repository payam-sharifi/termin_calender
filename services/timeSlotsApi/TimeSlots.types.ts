import { BlobOptions } from "buffer"

export interface Customer{
  id: string,
  name: string,
  family: string,
  email: string,
  phone: string,
  sex: string,
  is_verified: boolean
}

export interface TimeSlotsType{
  id:string,
  service_id: string,
  start_time: string,
  end_time: string,
  status:string,
  costumer:Customer
}
export interface seviceType{
  id: string,
  provider_id: string,
  title: string,
  duration: number,
  price: number,
  description: string
  is_active: boolean
  timeSlots:TimeSlotsType[]
}
export interface TimeSlotsRqType{
  name?:string,
  family?:string,
  email?:string,
  phone?:string,
  service_id: string,
  start_time: string,
  customer_id?:string
  end_time: string,
  status?:string
}
export interface ServiceRqType{
  provider_id: string,
  start_time: string,
  end_time: string,
  status?:string
}
export type ServiceRsDataType = seviceType[];