import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { EnrollSeats } from "@/types/seat";

const seatLabels = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
]; //고정된 값으로 재랜더링 필요 x

interface SeatState extends EnrollSeats {
  isDirty: boolean;
  isAllAisle: number[];
}
const initialState: SeatState = {
  rows: 5,
  totalSeats: 50,
  rowsConfigs: {
    A: {
      seats: 10,
      aisles: [],
    },
    B: {
      seats: 10,
      aisles: [],
    },

    C: {
      seats: 10,
      aisles: [],
    },
    D: {
      seats: 10,
      aisles: [],
    },
    E: {
      seats: 10,
      aisles: [],
    },
  },
  isDirty: false,
  isAllAisle: [],
};

const seatSlice = createSlice({
  name: "seat",
  initialState,
  reducers: {
    setRows: (state, action: PayloadAction<number>) => {
      state.rows = action.payload;
    },
    addRowsConfigs: (state, action: PayloadAction<number>) => {
      const key = seatLabels[action.payload];
      state.rowsConfigs[key] = {
        seats: 10,
        aisles: [],
      };
      state.totalSeats += 10;
    },
    deleteRowsConfigs: (state, action: PayloadAction<number>) => {
      const key = seatLabels[action.payload]; // seatLabels에서 인덱스를 기반으로 키를 가져옴
      state.totalSeats -= state.rowsConfigs[key].seats;
      delete state.rowsConfigs[key];
    },
    updateSeats: (
      state,
      action: PayloadAction<{ rowLabel: string; newSeats: number }>
    ) => {
      const { rowLabel, newSeats } = action.payload;
      if (state.rowsConfigs[rowLabel]) {
        const currentSeats = state.rowsConfigs[rowLabel].seats;
        state.rowsConfigs[rowLabel].seats = newSeats;
        state.totalSeats = state.totalSeats - currentSeats + newSeats;
      }
    },
    removeAisles: (
      state,
      action: PayloadAction<{ rowLabel: string; aisleNumber: number }>
    ) => {
      const { rowLabel, aisleNumber } = action.payload;
      if (state.rowsConfigs[rowLabel]) {
        state.rowsConfigs[rowLabel].aisles = state.rowsConfigs[
          rowLabel
        ].aisles.filter((aisle) => aisle !== aisleNumber);
      }
    },
    addAisles: (
      state,
      action: PayloadAction<{ rowLabel: string; aisleNumber: number }>
    ) => {
      const { rowLabel, aisleNumber } = action.payload;
      if (state.rowsConfigs[rowLabel]) {
        state.rowsConfigs[rowLabel].aisles.push(aisleNumber);
      }
    },
    addIsAllAisle: (state, action: PayloadAction<number>) => {
      state.isAllAisle.push(action.payload);
    },
    removeIsAllAisle: (state, action: PayloadAction<number>) => {
      state.isAllAisle = state.isAllAisle.filter(
        (aisle) => aisle !== action.payload
      );
    },
    resetIsAllAisle: (state) => {
      state.isAllAisle = [];
    },
    resetSeatState: () => {
      return initialState;
    },
  },
});

export const {
  setRows,
  addRowsConfigs,
  deleteRowsConfigs,
  updateSeats,
  removeAisles,
  addAisles,
  addIsAllAisle,
  removeIsAllAisle,
  resetIsAllAisle,
  resetSeatState,
} = seatSlice.actions;

export default seatSlice.reducer;
