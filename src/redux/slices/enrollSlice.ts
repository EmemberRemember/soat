import { ImageFile } from "@/types/file";
import {
  DailyPerformances,
  EnrollStep,
  Performance,
} from "./../../types/enrollment";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { format } from "date-fns";

export interface EnrollState {
  title: string;
  category: string;
  bookingStartDate: string;
  bookingEndDate: string;
  postCode: string;
  address: string;
  detailAddress: string;
  poster: ImageFile | null;
  performances: DailyPerformances;
  content: string;
  files: string[];
  price: number;
  isDirty: boolean; //수정 상태를 관리하는 상태
  step: EnrollStep;
  invalidField: string;
}

export const EnrollInitialState: EnrollState = {
  title: "",
  category: "",
  bookingStartDate: "",
  bookingEndDate: "",
  postCode: "",
  address: "",
  detailAddress: "",
  poster: null,
  performances: {},
  content: "",
  files: [],
  price: 0,
  isDirty: false,
  step: 0,
  invalidField: "",
};

const enrollSlice = createSlice({
  name: "enroll",
  initialState: EnrollInitialState,
  reducers: {
    setTitle: (state, action: PayloadAction<string>) => {
      state.title = action.payload;
      state.isDirty = true;
    },
    setCategory: (state, action: PayloadAction<string>) => {
      state.category = action.payload;
      state.isDirty = true;
    },
    setBookingStartDate: (state, action: PayloadAction<string>) => {
      state.bookingStartDate = action.payload;
      state.isDirty = true;
    },
    setBookingEndDate: (state, action: PayloadAction<string>) => {
      state.bookingEndDate = action.payload;
      state.isDirty = true;
    },
    setAddress: (state, action: PayloadAction<string>) => {
      state.address = action.payload;
      state.isDirty = true;
    },
    setDetailAddress: (state, action: PayloadAction<string>) => {
      state.detailAddress = action.payload;
      state.isDirty = true;
    },
    setPostCode: (state, action: PayloadAction<string>) => {
      state.postCode = action.payload;
      state.isDirty = true;
    },
    setPrice: (state, action: PayloadAction<number>) => {
      state.price = action.payload;
      state.isDirty = true;
    },
    setPoster: (state, action: PayloadAction<ImageFile | null>) => {
      state.poster = action.payload;
      state.isDirty = true;
    },
    setContent: (state, action: PayloadAction<string>) => {
      state.content = action.payload;
      state.isDirty = true;
    },
    addPerformance: (
      state,
      action: PayloadAction<{
        dates: string[];
        time: string;
        casting: string[];
      }>
    ) => {
      const { dates, time, casting } = action.payload;
      dates.map((date) => {
        if (!state.performances[date]) {
          state.performances[date] = [];
        }
        state.performances[date].push({
          time,
          casting,
        });
      });
      state.isDirty = true;
    },

    editPerformance: (
      state,
      action: PayloadAction<{
        date: string;
        index: number;
        performance: Performance;
      }>
    ) => {
      const { date, index, performance } = action.payload;
      const formattedDate = format(new Date(date), "yyyy-MM-dd");

      if (state.performances[formattedDate]) {
        state.performances[formattedDate][index] = performance;
      }
      state.isDirty = true;
    },

    removePerformance: (
      state,
      action: PayloadAction<{
        date: string;
        index: number;
      }>
    ) => {
      const { date, index } = action.payload;
      const formattedDate = format(new Date(date), "yyyy-MM-dd");

      if (state.performances[formattedDate]) {
        state.performances[formattedDate] = state.performances[
          formattedDate
        ].filter((_, i) => i !== index);

        // 해당 날짜의 공연이 모두 삭제되면 객체에서 해당 날짜 키도 제거
        if (state.performances[formattedDate].length === 0) {
          delete state.performances[formattedDate];
        }
      }
      state.isDirty = true;
    },
    addFile: (state, action: PayloadAction<string>) => {
      state.files.push(action.payload);
      state.isDirty = true;
    },
    deleteFile: (state, action: PayloadAction<string>) => {
      state.files = state.files.filter((key) => key !== action.payload);
      state.isDirty = true;
    },
    resetDirty: (state) => {
      state.isDirty = false;
    },
    setStep: (state, action: PayloadAction<EnrollStep>) => {
      state.step = action.payload;
    },
    resetEnrollState: () => {
      return EnrollInitialState;
    },
    setInvalidField: (state, action: PayloadAction<string>) => {
      state.invalidField = action.payload;
    },
  },
});

export const {
  setTitle,
  setCategory,
  setBookingStartDate,
  setBookingEndDate,
  setAddress,
  setDetailAddress,
  setPostCode,
  setPoster,
  setContent,
  addPerformance,
  editPerformance,
  removePerformance,
  addFile,
  deleteFile,
  resetDirty,
  setPrice,
  setStep,
  resetEnrollState,
  setInvalidField,
} = enrollSlice.actions;

export default enrollSlice.reducer;
