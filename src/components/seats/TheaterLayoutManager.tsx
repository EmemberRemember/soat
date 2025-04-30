"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button as BtnUi } from "@/components/ui/button";
import { Button } from "../controls/Button";
import { Label } from "@/components/ui/label";
import { Plus, Minus } from "lucide-react";

// 좌석 배치 데이터 인터페이스
interface RowConfig {
  seats: number;
  aisles: Set<number>;
}

interface RowConfigs {
  [key: string]: RowConfig;
}

// 저장될 좌석 배치 데이터 형식
export interface TheaterLayoutData {
  rows: number;
  rowsConfigs: {
    [key: string]: {
      seats: number;
      aisles: number[];
    };
  };
  totalSeats: number;
  performanceName: string;
  lastModified: string;
}

export interface OccupiedSeat {
  seatId: string;
  occupantId: string;
  occupiedAt: Date;
  status: "processing" | "pending" | "booked";
  reservationId: string;
}

function TheaterLayoutManager(): JSX.Element {
  const [rows, setRows] = useState<number>(5);
  const [rowConfigs, setRowConfigs] = useState<RowConfigs>(() => {
    const configs: RowConfigs = {};
    for (let i = 0; i < 5; i++) {
      configs[String.fromCharCode(65 + i)] = {
        seats: 10,
        aisles: new Set<number>(),
      };
    }
    return configs;
  });

  // 좌석 번호 생성 (통로 고려)
  function getSeatNumber(rowLetter: string, physicalIndex: number): string {
    const rowConfig = rowConfigs[rowLetter];

    // 현재 위치가 통로인지 확인
    const isCurrentAisle = rowConfig.aisles.has(physicalIndex);

    // 통로인 경우 빈 문자열 반환 (좌석 번호 없음)
    if (isCurrentAisle) {
      return "";
    }

    // 해당 위치의 실제 좌석 번호 계산
    let seatNumber = physicalIndex + 1;

    // 현재 위치 앞에 있는 통로들을 확인
    for (let i = 0; i < physicalIndex; i++) {
      if (rowConfig.aisles.has(i) && isColumnAllAisles(i)) {
        // 해당 열이 모든 행에서 통로인 경우에만 번호를 건너뜀
        seatNumber--;
      }
    }

    return `${rowLetter}${seatNumber}`;
  }

  // 특정 열이 모든 행에서 통로인지 확인하는 함수
  function isColumnAllAisles(columnIndex: number): boolean {
    // 모든 행을 확인
    const allRows = Object.keys(rowConfigs);

    // 해당 열이 존재하는지 확인 (일부 행은 더 짧을 수 있음)
    const rowsWithColumn = allRows.filter((row) => {
      const totalPositions =
        rowConfigs[row].seats + rowConfigs[row].aisles.size;
      return columnIndex < totalPositions;
    });

    // 행이 충분히 있는지 확인 (최소 2개 이상)
    if (rowsWithColumn.length < 2) {
      return false;
    }

    // 해당 열이 존재하는 모든 행에서 통로인지 확인
    return rowsWithColumn.every((row) =>
      rowConfigs[row].aisles.has(columnIndex)
    );
  }

  // 행 추가
  function addRow(): void {
    if (rows >= 26) return;
    const newRowLetter = String.fromCharCode(65 + rows);
    setRowConfigs((prev) => ({
      ...prev,
      [newRowLetter]: {
        seats: 10,
        aisles: new Set<number>(),
      },
    }));
    setRows((prev) => prev + 1);
  }

  // 행 제거
  function removeRow(): void {
    if (rows <= 1) return;
    const lastRowLetter = String.fromCharCode(65 + rows - 1);
    setRowConfigs((prev) => {
      const newConfig = { ...prev };
      delete newConfig[lastRowLetter];
      return newConfig;
    });
    setRows((prev) => prev - 1);
  }

  // 좌석 수 조정
  function adjustRowSeats(rowLetter: string, change: number): void {
    setRowConfigs((prev) => {
      const currentSeats = prev[rowLetter].seats;
      const newSeats = Math.max(1, Math.min(20, currentSeats + change));

      const totalPositions = newSeats + prev[rowLetter].aisles.size;
      const newAisles = new Set(
        Array.from(prev[rowLetter].aisles).filter(
          (aisle) => aisle < totalPositions
        )
      );

      return {
        ...prev,
        [rowLetter]: {
          ...prev[rowLetter],
          seats: newSeats,
          aisles: newAisles,
        },
      };
    });
  }

  // 통로 토글
  function handleAisleToggle(rowLetter: string, physicalIndex: number): void {
    setRowConfigs((prev) => {
      const newAisles = new Set(prev[rowLetter].aisles);
      if (newAisles.has(physicalIndex)) {
        newAisles.delete(physicalIndex);
      } else {
        newAisles.add(physicalIndex);
      }

      return {
        ...prev,
        [rowLetter]: {
          ...prev[rowLetter],
          aisles: newAisles,
        },
      };
    });
  }

  // 좌석 배치 저장
  function handleSave(): void {
    const layoutData: TheaterLayoutData = {
      rows: rows,
      rowsConfigs: Object.fromEntries(
        Object.entries(rowConfigs).map(([row, config]) => [
          row,
          {
            seats: config.seats,
            aisles: Array.from(config.aisles),
          },
        ])
      ),
      totalSeats: Object.values(rowConfigs).reduce(
        (total, config) => total + config.seats,
        0
      ),
      performanceName: "SCREEN 1", // 나중에 입력받을 수 있도록 수정 가능
      lastModified: new Date().toISOString(),
    };
    console.log("저장된 좌석 배치:", layoutData);
    // 여기에 저장 API 호출 로직 추가 가능
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>좌석 배치 관리</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* 행 관리 */}
          <div className="flex items-center gap-4">
            <BtnUi
              variant="outline"
              size="sm"
              onClick={removeRow}
              disabled={rows <= 1}
            >
              <Minus className="w-4 h-4" />
            </BtnUi>
            <Label>전체 행 수: {rows}</Label>
            <BtnUi
              variant="outline"
              size="sm"
              onClick={addRow}
              disabled={rows >= 26}
            >
              <Plus className="w-4 h-4" />
            </BtnUi>
          </div>

          {/* 통로 설정 안내 */}
          <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
            빈 칸을 클릭하면 통로로 설정됩니다. 통로 설정 시 좌석 번호가
            자동으로 조정됩니다.
          </div>

          {/* 스크린 */}
          <div className="w-full bg-gray-300 h-8 rounded-lg flex items-center justify-center text-sm text-gray-600">
            무대
          </div>

          {/* 좌석 배치도 */}
          <div className="bg-gray-100 p-6 rounded-lg">
            <div className="space-y-4  overflow-x-scroll">
              {Array.from({ length: rows }).map((_, rowIndex) => {
                const rowLetter = String.fromCharCode(65 + rowIndex);
                const rowConfig = rowConfigs[rowLetter];
                const totalPositions = rowConfig.seats + rowConfig.aisles.size;

                return (
                  <div key={rowLetter} className="flex items-center gap-4">
                    {/* 행 레이블과 좌석 수 조정 */}
                    <div className="flex items-center gap-2 w-fit">
                      <span className="font-bold w-6">{rowLetter}</span>
                      <BtnUi
                        variant="outline"
                        size="sm"
                        onClick={() => adjustRowSeats(rowLetter, -1)}
                        disabled={rowConfig.seats <= 1}
                      >
                        <Minus className="w-3 h-3" />
                      </BtnUi>
                      <span className="w-[2rem] flex-shrink-0 text-center">
                        {rowConfig.seats}
                      </span>
                      <BtnUi
                        variant="outline"
                        size="sm"
                        onClick={() => adjustRowSeats(rowLetter, 1)}
                        disabled={totalPositions >= 20}
                      >
                        <Plus className="w-3 h-3" />
                      </BtnUi>
                    </div>

                    {/* 좌석/통로 표시 */}
                    <div className="flex gap-2">
                      {Array.from({ length: totalPositions }).map(
                        (_, physicalIndex) => {
                          const isAisle = rowConfig.aisles.has(physicalIndex);
                          const seatId = isAisle
                            ? ""
                            : getSeatNumber(rowLetter, physicalIndex);

                          return (
                            <BtnUi
                              key={`${rowLetter}-${physicalIndex}`}
                              variant={isAisle ? "ghost" : "outline"}
                              className={`w-6 h-6 p-1 text-xs ${
                                isAisle ? "bg-gray-200" : ""
                              }`}
                              onClick={() =>
                                handleAisleToggle(rowLetter, physicalIndex)
                              }
                            >
                              {seatId}
                            </BtnUi>
                          );
                        }
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 저장 버튼 */}
          <Button highlight className="w-full" onClick={handleSave}>
            좌석 배치 저장
          </Button>

          {/* 좌석 정보 */}
          <div className="text-sm text-gray-600">
            전체 좌석 수:{" "}
            {Object.values(rowConfigs).reduce(
              (total, config) => total + config.seats,
              0
            )}
            개
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default TheaterLayoutManager;
