import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface BookingDetails {
    date: string;
    timeStart: string;
    timeEnd: string;
    attendees: number;
}

export interface PriceItem {
    label: string;
    amount: string;
}

export interface BookingData {
    bookingDetails: BookingDetails;
    message: string;
    priceItems: PriceItem[];
    total: string;
    totalAmount: number;
    instantTotalAmount?: number;
    customRules?: string[];
    cancellationPolicy?: {
        key: string;
        message: string;
    };
}

interface BookingState {
    bookingData: BookingData | null;
    isInstantBooking: boolean;
    isLoading: boolean;
    error: string | null;
}

const initialState: BookingState = {
    bookingData: null,
    isInstantBooking: false,
    isLoading: false,
    error: null,
};

const bookingSlice = createSlice({
    name: 'booking',
    initialState,
    reducers: {
        setBookingData: (state, action: PayloadAction<BookingData>) => {
            state.bookingData = action.payload;
            state.error = null;
        },
        setIsInstantBooking: (state, action: PayloadAction<boolean>) => {
            state.isInstantBooking = action.payload;
        },
        updateBookingDetails: (state, action: PayloadAction<Partial<BookingDetails>>) => {
            if (state.bookingData) {
                state.bookingData.bookingDetails = {
                    ...state.bookingData.bookingDetails,
                    ...action.payload,
                };
            }
        },
        updateMessage: (state, action: PayloadAction<string>) => {
            if (state.bookingData) {
                state.bookingData.message = action.payload;
            }
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
        clearBookingData: (state) => {
            state.bookingData = null;
            state.isInstantBooking = false;
            state.error = null;
        },
    },
});

export const {
    setBookingData,
    setIsInstantBooking,
    updateBookingDetails,
    updateMessage,
    setLoading,
    setError,
    clearBookingData,
} = bookingSlice.actions;

export default bookingSlice.reducer;
