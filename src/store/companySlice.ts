import { createSlice } from "@reduxjs/toolkit";

const companySlice = createSlice({
    name:'company',
    initialState:{
        companyName:'RsHing',
        Address:'pathwari gali garhi tamana hathras',
        mobileNo:'1234567890',
        GstNo:'123456789012345'
    },
    reducers:{

    }
})

export default companySlice.reducer;

export const selectCompany = (state: any) => state.company;

