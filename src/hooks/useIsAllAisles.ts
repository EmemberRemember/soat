"use client";

import { addIsAllAisle } from "@/redux/slices/seatSlice"; // 기본 슬라이스 액션
import { addIsAllAisle as addIsAllAisleEdit } from "@/redux/slices/seatEditSlice"; // 편집 슬라이스 액션
import { useDispatch } from "react-redux";
import { RowConfigs } from "@/types/seat"; // RowsConfigs 타입 정의 필요

interface UseIsAllAislesProps {
  isEdit: boolean;
}

export const useIsAllAisles = ({ isEdit }: UseIsAllAislesProps) => {
  const dispatch = useDispatch();

  const dispatchAddIsAllAisle = (aisle: number) => {
    dispatch(isEdit ? addIsAllAisleEdit(aisle) : addIsAllAisle(aisle));
  };

  const validateRemainingAisles = (rowsConfigs : RowConfigs) => {
    const targetSeats = Object.values(rowsConfigs).slice(0, -1);

    const aislesSet = new Set(
      targetSeats
        .map((rowConfig) => rowConfig.aisles)
        .reduce((acc, aisles) => acc.concat(aisles), [])
    );

    aislesSet.forEach((aisle) => {
      const isAllAisle = targetSeats
        .filter((rowConfig) => rowConfig.seats >= aisle)
        .every((rowConfig) => rowConfig.aisles.includes(aisle));
      if (isAllAisle) {
        dispatchAddIsAllAisle(aisle);
      }
    });
  };

  const isAisleInAllRows = (targetSeatLabel: string, targetAisles: number , rowsConfigs : RowConfigs) => {
    return Object.keys(rowsConfigs)
      .filter((seatLabel) => seatLabel !== targetSeatLabel)
      .filter((seatLabel) => rowsConfigs[seatLabel].seats >= targetAisles)
      .every((key) => {
        const rowConfig = rowsConfigs[key];
        return rowConfig.aisles.includes(targetAisles);
      });
  };

  return { validateRemainingAisles, isAisleInAllRows };
};