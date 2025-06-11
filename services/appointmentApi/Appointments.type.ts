
export enum StatusAppointmentEnum {
  "Pending",
  "Confirmed",
  "Completed",
  "Cancelled"
}
export interface CreateAppointmentRqDataType {
  customer_id:string // # ForeignKey to User (Customer)
  provider_id:string //# ForeignKey to User (Provider)
  service_id:string // # ForeignKey to Service
  time_slot_id:string // # ForeignKey to TimeSlot
  status:StatusAppointmentEnum
  notes:string // # توضیحات مشتری
}


export interface getAppointmentsRqByDateAndUserId {
  userId?:string
  start_Time?:string
  end_Time?:string
}

