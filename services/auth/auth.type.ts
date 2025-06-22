
export  interface loginRqDataType{
phone?:string,
password?:string
code?:string,
}


export  interface loginRsType{
   token:string
}

export interface registerUserRqType{
   name: string;
   family: string;
   email: string;
   phone: string;
   code:string
   sex: string;
   password: string;
   role?: string;
   is_verified?: true;
}

export type LoginResponseTypeData = {
    success: boolean;
    data: string;
    message: string;
  };