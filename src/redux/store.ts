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
import enrollReducer from "./slices/enrollSlice";
import seatReducer from "./slices/seatSlice";
export const enrollPersistConfig = {
  key: "enroll", // enroll 상태의 키
  storage, // localStorage 사용
  throttle: 300,
  blacklist: ["isDirty", "step"],
};

const seatPersistConfig = {
  key: "seats",
  storage,
  throttle: 300,
  blacklist: ["isDirty"],
};

const persistedEnrollReducer = persistReducer(
  enrollPersistConfig,
  enrollReducer
);

const persistedSeatReducer = persistReducer(seatPersistConfig, seatReducer);

const rootReducer = combineReducers({
  enroll: persistedEnrollReducer,
  seat: persistedSeatReducer,
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
// export const persistor = persistStore(store, { manualPersist: true }); //공식문서에는 존재하는 옵션인데 찾을 수 없다고 뜨네요..
export const persistor = persistStore(store); // 52번줄 build error로 주석처리 해두었습니다.
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
