// hooks/useSeatData.ts
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { EnrollSeats } from "@/types/seat";

interface UseSeatDataProps {
  isEdit: boolean;
}

interface UseSeatDataResult extends EnrollSeats {
  isDirty: boolean;
  isAllAisle: number[];
}

export const useSeatData = ({ isEdit }: UseSeatDataProps): UseSeatDataResult => {
  const seat = useSelector((state: RootState) => state.seat);
  const editSeat = useSelector((state: RootState) => state.seatEdit);

  return {
    rows: isEdit ? editSeat.rows : seat.rows,
    totalSeats: isEdit ? editSeat.totalSeats : seat.totalSeats,
    rowsConfigs: isEdit ? editSeat.rowsConfigs : seat.rowsConfigs,
    isDirty: isEdit ? editSeat.isDirty : seat.isDirty,
    isAllAisle: isEdit ? editSeat.isAllAisle : seat.isAllAisle,
  };
};