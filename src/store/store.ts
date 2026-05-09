import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
    persistStore,
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { setupListeners } from '@reduxjs/toolkit/query';
import authReducer from './slice/authSlice';
import spaceReducer from './slice/spaceTypeSlice';
import searchReducer from './slice/homePageSearchSlice';
import headerNotificationReducer from './slice/headerNotificationSlice';
import bookingReducer from './slice/bookingSlice';

const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['auth', 'spaceType', 'search', 'booking'],
};

const rootReducer = combineReducers({
    auth: authReducer,
    spaceType: spaceReducer,
    homeSearchData: searchReducer,
    headerNotification: headerNotificationReducer,
    booking: bookingReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});

export const persistor = persistStore(store);

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

export default store;
