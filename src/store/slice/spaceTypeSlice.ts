import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SpaceState {
    spaceId: number | null;
}

const initialState: SpaceState = {
    spaceId: null,
};

const spaceSlice = createSlice({
    name: 'space',
    initialState,
    reducers: {
        setSpaceId: (state, action: PayloadAction<number>) => {
            state.spaceId = action.payload;
        },
        clearSpaceId: (state) => {
            state.spaceId = null;
        },
    },
});

export const { setSpaceId, clearSpaceId } = spaceSlice.actions;
export default spaceSlice.reducer;
