// hooks/usePerformanceActions.ts
import { useDispatch } from "react-redux";
import { addPerformance, editPerformance , removePerformance} from "@/redux/slices/enrollSlice";
import {
  addEditPerformance,
  editEditPerformance,
  removeEditPerformance
} from "@/redux/slices/enrollEditSlice";
import { useCallback } from "react";

interface UsePerformanceActionsProps {
  isEdit: boolean;
}

interface UsePerformanceActionsResult {
  onAddPerformance: (dates: string[], time: string, casting: string[]) => void;
  onEditPerformance: (
    date: string,
    index: number,
    performance: { time: string; casting: string[] }
  ) => void;
  onDeletePerformance: (removeDate: string ,index: number) => void;
}

export const usePerformanceActions = ({
  isEdit,
}: UsePerformanceActionsProps): UsePerformanceActionsResult => {
  const dispatch = useDispatch();

  return {
    onAddPerformance: useCallback(
      (dates: string[], time: string, casting: string[]) => {
        dispatch(
          isEdit
            ? addEditPerformance({ dates, time, casting })
            : addPerformance({ dates, time, casting })
        );
      },
      [dispatch, isEdit]
    ),
    onEditPerformance: useCallback(
      (date: string, index: number, performance: { time: string; casting: string[] }) => {
        dispatch(
          isEdit
            ? editEditPerformance({ date, index, performance })
            : editPerformance({ date, index, performance })
        );
      },
      [dispatch, isEdit]
      ),
      onDeletePerformance: useCallback((removeDate : string ,index: number) => {
          dispatch(
            isEdit ? removeEditPerformance({date : removeDate , index}) : removePerformance({date: removeDate , index})
        )
    }, [dispatch , isEdit])
  };
};