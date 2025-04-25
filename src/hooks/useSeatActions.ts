// hooks/useSeatActions.ts
import { useDispatch } from "react-redux";
import { useCallback } from "react";
import {
  addAisles as addAislesAction,
  addIsAllAisle as addIsAllAisleAction,
  removeAisles as removeAislesAction,
  removeIsAllAisle as removeIsAllAisleAction,
  updateSeats as updateSeatsAction,
  addRowsConfigs as addRowsConfigsAction,
  deleteRowsConfigs as deleteRowsConfigsAction,
  setRows as setRowsAction,
  resetIsAllAisle as resetIsAllAisleMainAction,
} from "@/redux/slices/seatSlice";
import {
  addAisles as addAislesEditAction,
  addIsAllAisle as addIsAllAisleEditAction,
  removeAisles as removeAislesEditAction,
  removeIsAllAisle as removeIsAllAisleEditAction,
  updateSeats as updateSeatsEditAction,
  addRowsConfigs as addRowsConfigsEditAction,
  deleteRowsConfigs as deleteRowsConfigsEditAction,
  setRows as setRowsEditAction,
  resetIsAllAisle as resetIsAllAisleEditAction,
} from "@/redux/slices/seatEditSlice";

interface UseSeatActionsProps {
  isEdit: boolean;
}

interface UseSeatActionsResult {
  addAisles: (rowLabel: string, aisleNumber: number) => void;
  addIsAllAisle: (aisleNumber: number) => void;
  removeAisles: (rowLabel: string, aisleNumber: number) => void;
  removeIsAllAisle: (aisleNumber: number) => void;
  updateSeats: (rowLabel: string, newSeats: number) => void;
  addRowsConfigs: (index: number) => void;
  deleteRowsConfigs: (index: number) => void;
  setRows: (newRows: number) => void;
  resetIsAllAisle: () => void;
}

export const useSeatActions = ({ isEdit }: UseSeatActionsProps): UseSeatActionsResult => {
  const dispatch = useDispatch();

  const addAisles = useCallback(
    (rowLabel: string, aisleNumber: number) => {
      dispatch(isEdit ? addAislesEditAction({ rowLabel, aisleNumber }) : addAislesAction({ rowLabel, aisleNumber }));
    },
    [dispatch, isEdit]
  );

  const addIsAllAisle = useCallback(
    (aisleNumber: number) => {
      dispatch(isEdit ? addIsAllAisleEditAction(aisleNumber) : addIsAllAisleAction(aisleNumber));
    },
    [dispatch, isEdit]
  );

  const removeAisles = useCallback(
    (rowLabel: string, aisleNumber: number) => {
      dispatch(isEdit ? removeAislesEditAction({ rowLabel, aisleNumber }) : removeAislesAction({ rowLabel, aisleNumber }));
    },
    [dispatch, isEdit]
  );

  const removeIsAllAisle = useCallback(
    (aisleNumber: number) => {
      dispatch(isEdit ? removeIsAllAisleEditAction(aisleNumber) : removeIsAllAisleAction(aisleNumber));
    },
    [dispatch, isEdit]
  );

  const updateSeats = useCallback(
    (rowLabel: string, newSeats: number) => {
      dispatch(isEdit ? updateSeatsEditAction({ rowLabel, newSeats }) : updateSeatsAction({ rowLabel, newSeats }));
    },
    [dispatch, isEdit]
  );

  const addRowsConfigs = useCallback(
    (index: number) => {
      dispatch(isEdit ? addRowsConfigsEditAction(index) : addRowsConfigsAction(index));
    },
    [dispatch, isEdit]
  );

  const deleteRowsConfigs = useCallback(
    (index: number) => {
      dispatch(isEdit ? deleteRowsConfigsEditAction(index) : deleteRowsConfigsAction(index));
    },
    [dispatch, isEdit]
  );

  const setRows = useCallback(
    (newRows: number) => {
      dispatch(isEdit ? setRowsEditAction(newRows) : setRowsAction(newRows));
    },
    [dispatch, isEdit]
  );

  const resetIsAllAisle = useCallback(
    () => {
      dispatch(isEdit ? resetIsAllAisleEditAction() : resetIsAllAisleMainAction());
    },
    [dispatch, isEdit]
  );

  return {
    addAisles,
    addIsAllAisle,
    removeAisles,
    removeIsAllAisle,
    updateSeats,
    addRowsConfigs,
    deleteRowsConfigs,
    setRows,
    resetIsAllAisle,
  };
};