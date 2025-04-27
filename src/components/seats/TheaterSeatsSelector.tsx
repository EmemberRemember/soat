"use client";

import React, { useCallback } from "react";
import { Button } from "@/components/ui/button";
import type { OccupiedSeat } from "./TheaterLayoutManager"; // OccupiedSeat 타입을 가져오는 경로 확인 필요
import { SeatState } from "@/redux/slices/seatSlice";

export interface TheaterSeatSelectorProps {
  layoutData: SeatState;
  maxSelectableSeats?: number; // 기본값은 아래에서 설정
  selectedSeats: Set<string>;
  occupiedSeats: OccupiedSeat[];
  onSeatToggle: (seatId: string) => void;
  userId?: string; // 현재 사용자 ID
  disabled?: boolean; // 전체 컴포넌트 비활성화 여부
  myBookedSeats?: number;
}

// 좌석 상태에 따른 스타일 정의 (가독성을 위해 상수로 분리)
const SEAT_STYLES = {
  AVAILABLE: "bg-white hover:bg-gray-100", // 선택 가능
  SELECTED: "bg-flesh-500 text-white hover:bg-flesh-600 hover:text-white", // 내가 선택/점유 중
  DISABLED: "bg-gray-300 text-gray-500 cursor-not-allowed", // 선택 불가 (다른 사람 점유, 예매 완료 등)
};

function TheaterSeatSelector({
  layoutData,
  maxSelectableSeats = 4, // 최대 선택 가능 좌석 수 기본값 설정
  selectedSeats,
  occupiedSeats = [],
  onSeatToggle,
  userId,
  disabled: componentDisabled, // prop 이름 충돌 방지 위해 변경
  myBookedSeats = 0,
}: TheaterSeatSelectorProps): JSX.Element {
  // 특정 열이 모든 행에서 통로인지 확인하는 함수 (기존 코드 유지)
  const isColumnAllAisles = useCallback(
    (columnIndex: number): boolean => {
      const allRows = Object.keys(layoutData.rowsConfigs);
      const rowsWithColumn = allRows.filter((row) => {
        const totalPositions =
          layoutData.rowsConfigs[row].seats +
          layoutData.rowsConfigs[row].aisles.length;
        return columnIndex < totalPositions;
      });
      if (rowsWithColumn.length < 2) {
        return false;
      }
      return rowsWithColumn.every((row) =>
        layoutData.rowsConfigs[row].aisles.includes(columnIndex)
      );
    },
    [layoutData]
  );

  // 좌석 번호 생성 (통로 고려) (기존 코드 유지)
  const getSeatNumber = useCallback(
    (rowLetter: string, physicalIndex: number): string => {
      const rowConfig = layoutData.rowsConfigs[rowLetter];
      if (!rowConfig) return ""; // rowConfig가 없을 경우 빈 문자열 반환
      const aisles = new Set(rowConfig.aisles);
      let seatNumber = 0; // 실제 좌석 번호 (1부터 시작)
      let currentPhysicalIndex = 0;

      // physicalIndex까지 순회하며 실제 좌석 번호 계산
      while (currentPhysicalIndex <= physicalIndex) {
        // 현재 위치가 통로가 아니라면 좌석 번호 증가
        if (!aisles.has(currentPhysicalIndex)) {
          seatNumber++;
        }
        // 현재 위치가 physicalIndex와 같으면 루프 종료
        if (currentPhysicalIndex === physicalIndex) {
          break;
        }
        currentPhysicalIndex++;
      }

      return `${rowLetter}${seatNumber}`;
    },
    [layoutData] // isColumnAllAisles는 getSeatNumber 내부에서 직접 사용되지 않으므로 제거 가능
  );

  // 좌석이 비활성화되어야 하는지 확인 (요구사항에 맞게 수정)
  const isSeatDisabled = useCallback(
    (seatId: string): boolean => {
      // 1. 컴포넌트 전체가 비활성화 상태인 경우
      if (componentDisabled) {
        return true;
      }

      const occupiedSeat = occupiedSeats.find((seat) => seat.seatId === seatId);

      // 2. 좌석이 점유된 경우 (occupiedSeat 존재)
      if (occupiedSeat) {
        // 2-1. 'booked' 또는 'pending' 상태는 무조건 비활성화 (해제 불가)
        if (
          occupiedSeat.status === "booked" ||
          occupiedSeat.status === "pending"
        ) {
          return true;
        }
        // 2-2. 'processing' 상태인 경우
        if (occupiedSeat.status === "processing") {
          // 다른 사용자가 processing 중이면 비활성화
          if (occupiedSeat.occupantId !== userId) {
            return true;
          }
          // 내가 processing 중이면 활성화 (해제 가능해야 함)
          return false;
        }
      }

      // 3. 좌석이 비어있는 경우 (occupiedSeat 없음)
      // 3-1. 현재 UI에서 선택된 상태이면 활성화 (해제 가능)
      if (selectedSeats.has(seatId)) {
        return false;
      }
      // 3-2. 최대 선택 가능 좌석 수에 도달했고, 이 좌석이 선택되지 않았다면 비활성화 (추가 선택 불가)
      if (selectedSeats.size >= maxSelectableSeats) {
        return true;
      }

      // 4. 그 외의 경우 (빈 좌석, 선택 가능)
      return false;
    },
    [
      occupiedSeats,
      userId,
      selectedSeats,
      maxSelectableSeats,
      componentDisabled,
    ]
  );

  // 좌석 상태에 따른 스타일 결정 (요구사항에 맞게 수정)
  const getSeatStyle = useCallback(
    (seatId: string): string => {
      const occupiedSeat = occupiedSeats.find((seat) => seat.seatId === seatId);

      // 1. 좌석이 점유된 경우 (occupiedSeat 존재)
      if (occupiedSeat) {
        // 1-1. 'booked' 또는 'pending' 상태는 'DISABLED' 스타일
        if (
          occupiedSeat.status === "booked" ||
          occupiedSeat.status === "pending"
        ) {
          return SEAT_STYLES.DISABLED;
        }
        // 1-2. 'processing' 상태인 경우
        if (occupiedSeat.status === "processing") {
          // 내가 processing 중이면 'SELECTED' 스타일 (해제 가능하므로)
          if (occupiedSeat.occupantId === userId) {
            return SEAT_STYLES.SELECTED;
          }
          // 다른 사용자가 processing 중이면 'DISABLED' 스타일
          return SEAT_STYLES.DISABLED;
        }
      }

      // 2. 좌석이 비어있는 경우 (occupiedSeat 없음)
      // 2-1. 현재 UI에서 선택된 상태이면 'SELECTED' 스타일
      if (selectedSeats.has(seatId)) {
        return SEAT_STYLES.SELECTED;
      }

      // 3. 그 외 (빈 좌석, 선택 가능) 'AVAILABLE' 스타일
      return SEAT_STYLES.AVAILABLE;
    },
    [occupiedSeats, userId, selectedSeats]
  );

  return (
    <div className="space-y-6 p-4">
      {/* 좌석 상태 안내 */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
        <div className="flex items-center gap-1">
          <div
            className={`w-4 h-4 rounded-sm border border-2 ${SEAT_STYLES.AVAILABLE}`}
          ></div>
          <span>선택 가능</span>
        </div>
        <div className="flex items-center gap-1">
          <div
            className={`w-4 h-4 rounded-sm border border-2 ${SEAT_STYLES.SELECTED}`}
          ></div>
          <span>선택됨</span>
        </div>
        <div className="flex items-center gap-1">
          <div
            className={`w-4 h-4 rounded-sm border border-2 ${SEAT_STYLES.DISABLED}`}
          ></div>
          <span>선택 불가</span>
        </div>
      </div>

      {/* 좌석 배치도 */}
      <div className="bg-gray-100 p-2 rounded-lg overflow-x-auto flex flex-col justify-center items-center">
        <div className="w-fit space-y-2 flex flex-col justify-center items-center m-auto">
          {/* 무대 */}
          <div className="w-full bg-gray-300 h-8 mb-2 rounded-lg flex items-center justify-center text-sm text-gray-600">
            무대
          </div>
          {Array.from({ length: layoutData.rows }).map((_, rowIndex) => {
            const rowLetter = String.fromCharCode(65 + rowIndex);
            const rowConfig = layoutData.rowsConfigs[rowLetter];
            if (!rowConfig) return null; // rowConfig가 없는 경우 렌더링 방지

            const totalPositions = rowConfig.seats + rowConfig.aisles.length;

            return (
              <div key={rowLetter} className="flex items-center gap-1 w-full">
                {/* 행 문자 표시 (선택 사항) */}
                {/* <div className="w-6 text-center text-xs font-medium text-gray-500">{rowLetter}</div> */}

                {/* 좌석/통로 표시 */}
                <div className="flex gap-1">
                  {Array.from({ length: totalPositions }).map(
                    (_, physicalIndex) => {
                      const isAisle = rowConfig.aisles.includes(physicalIndex);
                      if (isAisle) {
                        return (
                          <div
                            key={`${rowLetter}-aisle-${physicalIndex}`} // 고유 키 부여
                            className="w-6 h-6" // 통로 스타일
                          />
                        );
                      }

                      const seatId = getSeatNumber(rowLetter, physicalIndex);
                      if (!seatId) return null; // 좌석 번호 생성 실패 시 렌더링 방지

                      const isDisabled = isSeatDisabled(seatId); // 좌석별 비활성화 상태 계산
                      const style = getSeatStyle(seatId); // 좌석별 스타일 계산

                      return (
                        <Button
                          key={seatId} // 고유 키로 seatId 사용
                          variant="outline"
                          className={`w-6 h-6 text-[10px] p-0 rounded-sm ${style}`} // 스타일 적용
                          onClick={() => onSeatToggle(seatId)}
                          disabled={isDisabled} // 계산된 비활성화 상태 적용
                          aria-label={`좌석 ${seatId}`} // 접근성 추가
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
        {selectedSeats.size > 0 ? (
          <>
            <div className="flex flex-wrap gap-2">
              {Array.from(selectedSeats)
                .sort() // 좌석 ID 정렬하여 표시
                .map((seatId) => (
                  <div
                    key={seatId}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium" // 스타일 조정
                  >
                    {seatId}
                  </div>
                ))}
            </div>
            <div className="text-sm text-gray-600">
              선택된 좌석 수: {selectedSeats.size} /{" "}
              {maxSelectableSeats - myBookedSeats}개
            </div>
          </>
        ) : (
          <div className="text-sm text-gray-500">선택된 좌석이 없습니다.</div>
        )}
      </div>
    </div>
  );
}

export default TheaterSeatSelector;
