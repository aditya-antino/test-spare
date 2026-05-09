import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface HeaderNotificationStatus {
    bookingRequest: boolean;
    reservation: {
        upcoming: boolean;
        completed: boolean;
        cancelled: boolean;
        rejected: boolean;
        pendingPayout: boolean;
    };
    chat: boolean;
    showHostMessageBadge: boolean;
    showGuestMessageBadge: boolean;
}

const initialState: HeaderNotificationStatus = {
    bookingRequest: true,
    reservation: {
        upcoming: true,
        completed: false,
        cancelled: true,
        rejected: false,
        pendingPayout: false,
    },
    chat: true,
    showHostMessageBadge: true,
    showGuestMessageBadge: true,
};

const headerNotificationSlice = createSlice({
    name: 'headerNotification',
    initialState,
    reducers: {
        setHeaderNotification: (state, action: PayloadAction<HeaderNotificationStatus>) => {
            return action.payload;
        },
        updateHeaderNotification: (
            state,
            action: PayloadAction<Partial<HeaderNotificationStatus>>,
        ) => {
            Object.assign(state, action.payload);
        },

        setHostMessageBadge: (state, action: PayloadAction<boolean>) => {
            state.showHostMessageBadge = action.payload;
        },
        setGuestMessageBadge: (state, action: PayloadAction<boolean>) => {
            state.showGuestMessageBadge = action.payload;
        },
    },
});

export const { setHeaderNotification, updateHeaderNotification, setHostMessageBadge, setGuestMessageBadge } =
    headerNotificationSlice.actions;

export default headerNotificationSlice.reducer;
