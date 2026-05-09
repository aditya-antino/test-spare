import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Item } from '@/types';

interface Activity {
    name: string;
    ids: number[];
}

interface SearchState {
    date?: string;
    startTime: string;
    endTime: string;
    searchVal: string;
    placesSearchVal: string;
    selectedCategories: Array<{ item: Item; type?: string }>;
    selectedActivities: Activity[];
    selectedPlace?: Item;
}

const initialState: SearchState = {
    date: '',
    startTime: '',
    endTime: '',
    searchVal: '',
    placesSearchVal: '',
    selectedCategories: [],
    selectedActivities: [],
    selectedPlace: undefined,
};

const searchSlice = createSlice({
    name: 'homeSearchData',
    initialState,
    reducers: {
        setDate: (state, action: PayloadAction<string | undefined>) => {
            state.date = action.payload;
        },
        setStartTime: (state, action: PayloadAction<string>) => {
            state.startTime = action.payload;
        },
        setEndTime: (state, action: PayloadAction<string>) => {
            state.endTime = action.payload;
        },
        setSearchVal: (state, action: PayloadAction<string>) => {
            state.searchVal = action.payload;
        },
        setPlacesSearchVal: (state, action: PayloadAction<string>) => {
            state.placesSearchVal = action.payload;
        },

        setSelectedCategories: (
            state,
            action: PayloadAction<Array<{ item: Item; type?: string }>>,
        ) => {
            state.selectedCategories = action.payload;
        },
        addSelectedCategory: (state, action: PayloadAction<{ item: Item; type?: string }>) => {
            const exists = state.selectedCategories.some(
                (category) => category.item.id === action.payload.item.id,
            );
            if (!exists) state.selectedCategories.push(action.payload);
        },
        removeSelectedCategory: (state, action: PayloadAction<number | string>) => {
            state.selectedCategories = state.selectedCategories.filter(
                (category) => category.item.id.toString() !== action.payload.toString(),
            );
        },
        clearSelectedCategories: (state) => {
            state.selectedCategories = [];
        },

        setSelectedActivities: (state, action: PayloadAction<Activity[]>) => {
            state.selectedActivities = action.payload;
        },
        addSelectedActivity: (state, action: PayloadAction<Activity>) => {
            const exists = state.selectedActivities.some(
                (activity) => activity.name === action.payload.name,
            );
            if (!exists) state.selectedActivities.push(action.payload);
        },
        removeSelectedActivity: (state, action: PayloadAction<string>) => {
            state.selectedActivities = state.selectedActivities.filter(
                (activity) => activity.name !== action.payload,
            );
        },
        clearSelectedActivities: (state) => {
            state.selectedActivities = [];
        },

        setSelectedPlace: (state, action: PayloadAction<Item | undefined>) => {
            state.selectedPlace = action.payload;
        },

        clearSearchFilters: (state) => {
            state.date = '';
            state.startTime = '';
            state.endTime = '';
        },

        clearAll: () => initialState,
    },
});

export const {
    setDate,
    setStartTime,
    setEndTime,
    setSearchVal,
    setPlacesSearchVal,
    setSelectedCategories,
    addSelectedCategory,
    removeSelectedCategory,
    clearSelectedCategories,
    setSelectedActivities,
    addSelectedActivity,
    removeSelectedActivity,
    clearSelectedActivities,
    setSelectedPlace,
    clearSearchFilters,
    clearAll,
} = searchSlice.actions;

export default searchSlice.reducer;
