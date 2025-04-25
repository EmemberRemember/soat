import { storage } from "./customStorage";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";

interface ManualPersistOptions extends PersistorOptions {
  manualPersist: boolean;
}

import enrollReducer from "./slices/enrollSlice";
import seatReducer from "./slices/seatSlice";
import enrollEditReducer from "./slices/enrollEditSlice"
import seatEditReducer from "./slices/seatEditSlice"
import { PersistorOptions } from "redux-persist/es/types";

export const enrollPersistConfig = {
  key: "enroll", // enroll 상태의 키
  storage, // localStorage 사용
  blacklist: ["isDirty", "step", "invalidField"],
};

export const seatPersistConfig = {
  key: "seats",
  storage,
  blacklist: ["isDirty", "step"],
};


const persistedEnrollReducer = persistReducer(
  enrollPersistConfig,
  enrollReducer
);

const persistedSeatReducer = persistReducer(seatPersistConfig, seatReducer);
const rootReducer = combineReducers({
  enroll: persistedEnrollReducer,
  seat: persistedSeatReducer,
  enrollEdit : enrollEditReducer,
  seatEdit: seatEditReducer
  //reducer 추가 부분
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: process.env.NODE_ENV !== "production",
});

export const persistor = persistStore(store, {
  manualPersist: true,
} as ManualPersistOptions);

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export default store;
