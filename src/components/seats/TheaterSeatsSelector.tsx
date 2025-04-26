"use client";

import React, { useCallback } from "react";
import { Button } from "@/components/ui/button";
import type { OccupiedSeat, TheaterLayoutData } from "./TheaterLayoutManager";
import { SeatState } from "@/redux/slices/seatSlice";

export interface TheaterSeatSelectorProps {
  layoutData: SeatState;
  maxSelectableSeats?: number;
  selectedSeats: Set<string>;
  occupiedSeats: OccupiedSeat[];
  onSeatToggle: (seatId: string) => void;
  userId?: string; // 현재 사용자 ID 추가
  disabled?: boolean; // 비활성화 여부
}

function TheaterSeatSelector({
  layoutData,
  maxSelectableSeats = 4,
  selectedSeats,
  occupiedSeats = [],
  onSeatToggle,
  userId,
  disabled,
}: TheaterSeatSelectorProps): JSX.Element {
  // 특정 열이 모든 행에서 통로인지 확인하는 함수
  const isColumnAllAisles = useCallback(
    (columnIndex: number): boolean => {
      // 모든 행을 확인
      const allRows = Object.keys(layoutData.rowsConfigs);

      // 해당 열이 존재하는지 확인 (일부 행은 더 짧을 수 있음)
      const rowsWithColumn = allRows.filter((row) => {
        const totalPositions =
          layoutData.rowsConfigs[row].seats +
          layoutData.rowsConfigs[row].aisles.length;
        return columnIndex < totalPositions;
      });

      // 행이 충분히 있는지 확인 (최소 2개 이상)
      if (rowsWithColumn.length < 2) {
        return false;
      }

      // 해당 열이 존재하는 모든 행에서 통로인지 확인
      return rowsWithColumn.every((row) =>
        layoutData.rowsConfigs[row].aisles.includes(columnIndex)
      );
    },
    [layoutData]
  );

  // 좌석 번호 생성 (통로 고려)
  const getSeatNumber = useCallback(
    (rowLetter: string, physicalIndex: number): string => {
      const rowConfig = layoutData.rowsConfigs[rowLetter];
      const aisles = new Set(rowConfig.aisles);

      // 해당 위치의 실제 좌석 번호 계산
      let seatNumber = physicalIndex + 1;

      // 현재 위치 앞에 있는 통로들을 확인
      for (let i = 0; i < physicalIndex; i++) {
        if (aisles.has(i) && isColumnAllAisles(i)) {
          // 해당 열이 모든 행에서 통로인 경우에만 번호를 건너뜀
          seatNumber--;
        }
      }

      return `${rowLetter}${seatNumber}`;
    },
    [layoutData, isColumnAllAisles]
  );

  // 좌석 상태에 따른 스타일 결정
  const getSeatStyle = (seatId: string) => {
    const isOccupied = occupiedSeats.some((seat) => seat.seatId === seatId);
    const isMySeat =
      isOccupied &&
      occupiedSeats.some(
        (seat) => seat.seatId === seatId && seat.occupantId === userId
      );
    const notAvailable =
      isOccupied &&
      occupiedSeats.some(
        (seat) => seat.status === "pending" || seat.status === "booked"
      );

    if (isOccupied && !isMySeat) {
      return "bg-gray-300 text-gray-500 cursor-not-allowed";
    }

    if (notAvailable) {
      return "bg-gray-300 text-gray-500 cursor-not-allowed";
    }

    if (isMySeat) {
      return "bg-flesh-500 text-white hover:bg-flesh-600 hover:text-white";
    }
    if (selectedSeats.has(seatId)) {
      return "bg-flesh-500 text-white hover:bg-flesh-600 hover:text-white";
    }
    return "bg-white hover:bg-gray-100";
  };

  // 좌석이 선택 가능한지 확인
  const isSeatDisabled = (seatId: string) => {
    const occupiedSeat = occupiedSeats.find((seat) => seat.seatId === seatId);
    const isOccupied = !!occupiedSeat;
    const isMySeat = isOccupied && occupiedSeat.occupantId === userId;
    const isPendingOrBooked =
      isOccupied &&
      (occupiedSeat.status === "pending" || occupiedSeat.status === "booked");

    // 다른 사람이 점유했거나, 상태가 pending 또는 booked이면 비활성화
    return (isOccupied && !isMySeat) || isPendingOrBooked;
  };

  return (
    <div className="space-y-6 p-4">
      {/* 좌석 상태 안내 */}
      <div className="flex gap-2 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-white border"></div>
          <span>선택 가능</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-flesh-500"></div>
          <span>선택됨</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-300"></div>
          <span>선택 불가</span>
        </div>
      </div>

      {/* 좌석 배치도 */}
      <div className="bg-gray-100 p-2 rounded-lg overflow-x-auto flex flex-col justify-center items-center">
        <div className="w-fit space-y-4 flex flex-col justify-center items-center m-auto">
          {/* 무대 */}
          <div className="w-full bg-gray-300 h-8 rounded-lg flex items-center justify-center text-sm text-gray-600">
            무대
          </div>
          {Array.from({ length: layoutData.rows }).map((_, rowIndex) => {
            const rowLetter = String.fromCharCode(65 + rowIndex);
            const rowConfig = layoutData.rowsConfigs[rowLetter];
            const totalPositions = rowConfig.seats + rowConfig.aisles.length;

            return (
              <div key={rowLetter} className="flex items-center gap-4 w-full">
                {/* 좌석 표시 */}
                <div className="flex gap-1">
                  {Array.from({ length: totalPositions }).map(
                    (_, physicalIndex) => {
                      const isAisle = rowConfig.aisles.includes(physicalIndex);
                      if (isAisle) {
                        return (
                          <div
                            key={`${rowLetter}-${physicalIndex}`}
                            className="w-6 h-6"
                          />
                        );
                      }

                      const seatId = getSeatNumber(rowLetter, physicalIndex);
                      return (
                        <Button
                          key={`${rowLetter}-${physicalIndex}`}
                          variant="outline"
                          className={`w-6 h-6 text-[10px] p-0 ${getSeatStyle(
                            seatId
                          )}`}
                          onClick={() => onSeatToggle(seatId)}
                          disabled={isSeatDisabled(seatId)}
                        >
                          {seatId}
                        </Button>
                      );
                    }
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 선택된 좌석 정보 */}
      <div className="space-y-2">
        <div className="text-sm font-medium">선택된 좌석</div>
        <div className="flex flex-wrap gap-2">
          {Array.from(selectedSeats).map((seatId) => (
            <div
              key={seatId}
              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
            >
              {seatId}
            </div>
          ))}
        </div>
        <div className="text-sm text-gray-600">
          선택된 좌석 수: {selectedSeats.size}개
        </div>
      </div>
    </div>
  );
}

export default TheaterSeatSelector;
