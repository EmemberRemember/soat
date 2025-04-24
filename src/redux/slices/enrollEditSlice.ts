import { ImageFile } from "@/types/file";
import {
  DailyPerformances,
  EnrollStep,
  Performance,
} from "./../../types/enrollment";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { format } from "date-fns";

export interface EnrollEditState {
  title: string;
  category: string;
  bookingStartDate: string;
  bookingEndDate: string;
  postCode: string;
  address: string;
  detailAddress: string;
  poster: ImageFile| null;
  performances: DailyPerformances;
  content: string;
  price: number;
  isDirty: boolean;
  step: EnrollStep;
  invalidField: string;
  files: string[];
}

const initialState: EnrollEditState = {
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
  price: 0,
  isDirty: false,
  step: 0,
  invalidField: "",
  files: [],
};

const enrollEditSlice = createSlice({
  name: "enrollEdit",
  initialState,
  reducers: {
    setEditTitle: (state, action: PayloadAction<string>) => {
      state.title = action.payload;
      state.isDirty = true;
    },
    setEditCategory: (state, action: PayloadAction<string>) => {
      state.category = action.payload;
      state.isDirty = true;
    },
    setEditBookingStartDate: (state, action: PayloadAction<string>) => {
      state.bookingStartDate = action.payload;
      state.isDirty = true;
    },
    setEditBookingEndDate: (state, action: PayloadAction<string>) => {
      state.bookingEndDate = action.payload;
      state.isDirty = true;
    },
    setEditAddress: (state, action: PayloadAction<string>) => {
      state.address = action.payload;
      state.isDirty = true;
    },
    setEditDetailAddress: (state, action: PayloadAction<string>) => {
      state.detailAddress = action.payload;
      state.isDirty = true;
    },
    setEditPostCode: (state, action: PayloadAction<string>) => {
      state.postCode = action.payload;
      state.isDirty = true;
    },
    setEditPrice: (state, action: PayloadAction<number>) => {
      state.price = action.payload;
      state.isDirty = true;
    },
    setEditPoster: (state, action: PayloadAction<ImageFile | null>) => {
      state.poster = action.payload;
      state.isDirty = true;
    },
    setEditContent: (state, action: PayloadAction<string>) => {
      state.content = action.payload;
      state.isDirty = true;
    },
    addEditFile: (state, action: PayloadAction<string>) => {
      state.files.push(action.payload);
      state.isDirty = true;
    },
    deleteEditFile: (state, action: PayloadAction<string>) => {
      state.files = state.files.filter((key) => key !== action.payload);
      state.isDirty = true;
    },
    addEditPerformance: (
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

    editEditPerformance: (
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

    removeEditPerformance: (
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
    resetEditDirty: (state) => {
      state.isDirty = false;
    },
    setEditStep: (state, action: PayloadAction<EnrollStep>) => {
      state.step = action.payload;
    },
    resetEnrollEditState: () => {
      return initialState;
    },
    setEditInvalidField: (state, action: PayloadAction<string>) => {
      state.invalidField = action.payload;
    },
    setEnrollEditData: (state, action: PayloadAction<EnrollEditState>) => {
      return {
        ...state,
        ...action.payload,
      }
    }
    
  },
});

export const {
  setEditTitle,
  setEditCategory,
  setEditBookingStartDate,
  setEditBookingEndDate,
  setEditAddress,
  setEditDetailAddress,
  setEditPostCode,
  setEditPoster,
  setEditContent,
  addEditFile,
  deleteEditFile,
  addEditPerformance,
  editEditPerformance,
  removeEditPerformance,
  resetEditDirty,
  setEditPrice,
  setEditStep,
  resetEnrollEditState,
  setEditInvalidField,
  setEnrollEditData
} = enrollEditSlice.actions;

export default enrollEditSlice.reducer;
