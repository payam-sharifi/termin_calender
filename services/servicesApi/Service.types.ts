export interface seviceType{
  id: string,
  provider_id: string,
  title: string,
  duration: number,
  price: number,
  description: string
  is_active: boolean
}
export type ServiceRsDataType = seviceType[];