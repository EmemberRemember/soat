"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import SeatSetRow from "../../seats/SeatSetRow";
import ControlRowButton from "../../seats/ControlRowButton";
import { useIsAllAisles } from "@/hooks/useIsAllAisles";
import { useSeatData } from "@/hooks/useSeatData";
import { useSeatActions } from "@/hooks/useSeatActions";

interface EnrollSeatProps {
  isEdit?: boolean;
}
export default function EnrollSeat({isEdit = false }: EnrollSeatProps) {
  const { rowsConfigs, rows, totalSeats } = useSeatData({
    isEdit 
  })
  const { addRowsConfigs, deleteRowsConfigs, setRows, resetIsAllAisle } = useSeatActions({ isEdit });
  const { validateRemainingAisles } = useIsAllAisles({ isEdit });

  const renderRows = () => {
    return Object.keys(rowsConfigs).map((rowsLabel, index) => {
      return <SeatSetRow key={index} seatLabel={rowsLabel} isEdit={isEdit} />;
    });
  };


  const handleOnClickAddRowsBtn = () => {
    if (rows === 26) {
      return;
    }
    resetIsAllAisle()
    setRows(rows + 1)
    addRowsConfigs(rows);
  };

  const handleOnClickRemoveRowsBtn = () => {
    if (rows <= 1) {
      return;
    }
    setRows(rows - 1);
    deleteRowsConfigs(rows - 1);
    validateRemainingAisles(rowsConfigs);
  };

  return (
    <>
      <Card className="w-full max-w-4xl mx-auto mb-[140px]">
        <CardHeader>
          <CardTitle>좌석 배치 하기</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* 행 관리 */}
            <ControlRowButton
              rowNums={rows}
              onMinus={handleOnClickRemoveRowsBtn}
              onPlus={handleOnClickAddRowsBtn}
            />
            {/* 통로 설정 안내 */}
            <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
              빈 칸을 클릭하면 통로로 설정됩니다. 통로 설정 시 좌석 번호가
              자동으로 조정됩니다.
            </div>

            {/* 스크린 */}
            <div className="w-full bg-gray-300 h-8 rounded-lg flex items-center justify-center text-sm text-gray-600">
              무대
            </div>
            {/*좌석 배치 */}
            <div className="bg-gray-100 p-6 rounded-lg ">
              <div className="space-y-4 overflow-x-scroll">{renderRows()}</div>
            </div>
            <div className="text-sm text-gray-600">
              전체 좌석 수: {totalSeats} 개
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
