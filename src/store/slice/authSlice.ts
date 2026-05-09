import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    accessToken: null,
    refreshToken: null,
    tempToken: null,
    isAuth: false,
    user: null,
    userRole: [],
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            const { accessToken, refreshToken } = action.payload;
            state.accessToken = accessToken || null;
            state.refreshToken = refreshToken || null;
            state.isAuth = Boolean(state.accessToken);

            if (typeof window !== 'undefined') {
                if (accessToken) localStorage.setItem('accessToken', accessToken);
                if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
            }
        },
        logout: (state) => {
            state.accessToken = null;
            state.refreshToken = null;
            state.tempToken = null;
            state.isAuth = false;
            state.user = null;
            state.userRole = null;

            if (typeof window !== 'undefined') {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('userData');
                localStorage.removeItem('userRoles');
                sessionStorage.removeItem('signup_step');
            }
        },
        setUserProfile: (state, action) => {
            state.user = action.payload || null;
        },
        setUserRole: (state, action) => {
            state.userRole = action.payload;
        },
    },
});

export const { setCredentials, logout, setUserProfile, setUserRole } = authSlice.actions;

export default authSlice.reducer;
