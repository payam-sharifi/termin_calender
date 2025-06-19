
export  interface loginRqDataType{
email?:string,
phone?:string,
password:string
}


export  interface loginRsType{
   token:string
}



export type LoginResponseTypeData = {
    success: boolean;
    data: string;
    message: string;
  };