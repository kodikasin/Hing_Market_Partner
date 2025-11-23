import { createSlice, PayloadAction } from "@reduxjs/toolkit";


export type address = {
    street : string;
    city:string;
    pincode:number;
    state:string
    country:string
}

export type companyDetail = {
    companyName: string;
    address: address;
    mobileNo: string;
    gstNo: string;
    email: string;
};

const initialState: companyDetail = {
    companyName: 'Rs Hing',
    address: {
        street:'pathwari gali',
        city:'Hathras',
        pincode:204101,
        state:'Uttar Pradesh',
        country:'india'
    },
    mobileNo: '1234567890',
    gstNo: '123456789012345',
    email: 'rajansingh@gmail.com',
};

const companySlice = createSlice({
    name: 'company',
    initialState,
    reducers: {
        updateCompany(state, action: PayloadAction<Partial<companyDetail>>) {
            return { ...state, ...action.payload };
        },
        setCompany(state, action: PayloadAction<companyDetail>) {
            return action.payload;
        },
    },
});

export const { updateCompany, setCompany } = companySlice.actions;

export default companySlice.reducer;

export const selectCompany = (state: any) => state.company;

