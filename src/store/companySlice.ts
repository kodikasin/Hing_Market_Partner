import { createSlice } from "@reduxjs/toolkit";

export type companyDetail = {
    companyName:string;
    address:string;
    mobileNo:string;
    gstNo:string;
    email:string

}

const companySlice = createSlice({
    name:'company',
    initialState:{
        companyName:'Rs Hing',
        address:'pathwari gali garhi tamana hathras',
        mobileNo:'1234567890',
        gstNo:'123456789012345',
        email:'rajansingh@gmail.com'
    },
    reducers:{

    }
})

export default companySlice.reducer;

export const selectCompany = (state: any) => state.company;

