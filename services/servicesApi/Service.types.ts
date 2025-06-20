export interface Costumer{
  id: string,
  name: string,
  family: string,
  email: string,
  phone: string,
  sex: string,         
  is_verified: true,
                
}
export interface TimeSlotsType {
  id: string,
  service_id: string,
  start_time: string,
  end_time: string,
  status: string,
  costumer:Costumer
}

export interface serviceType {
  id: string,
  provider_id: string,
  title: string,
  providerName: string,
  duration: number,
  price: number,
  color:string,
  description: string,
  is_active: boolean,
  timeSlots: TimeSlotsType[]
}

export interface createNewService {
  provider_id:string  
  title:string
  duration:number
  is_active:boolean
  price?:number
  color:string
  description?:string
}
export type ServiceRsDataType = serviceType[];