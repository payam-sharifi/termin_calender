


export interface TimeSlotsType{
  id:string,
  service_id: string,
  start_time: string,
  end_time: string,
  status:string,
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


export type ServiceRsDataType = seviceType[];