import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import userReducer from './slices/userSlice';
import authReducer from './slices/authSlice';
import clientReducer from './slices/clientSlice';
import certificateReducer from './slices/certificateSlice';
import annexure1Reducer from './slices/annexure1Slice';
import annexure2Reducer from './slices/annexure2Slice';
import guarantorReducer from './slices/guarantorSlice';


export const store = configureStore({
  reducer: {
    user: userReducer,
    auth: authReducer,
    clients: clientReducer,
    certificates: certificateReducer,
    annexure1: annexure1Reducer,
    annexure2: annexure2Reducer,
    guarantors: guarantorReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['user/setCurrentUser'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.createdAt'],
        // Ignore these paths in the state
        ignoredPaths: ['user.currentUser.createdAt'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks for use throughout the app
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

