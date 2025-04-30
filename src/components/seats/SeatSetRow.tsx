"use client";
import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import SeatItem from "./SeatItem";
import { useIsAllAisles } from "@/hooks/useIsAllAisles";
import { useSeatData } from "@/hooks/useSeatData";
import { useSeatActions } from "@/hooks/useSeatActions";

interface SeatSetRowProps {
  seatLabel: string;
  isEdit?: boolean;
}
export default function SeatSetRow({ seatLabel , isEdit=false }: SeatSetRowProps) {
  const { rowsConfigs , isAllAisle } = useSeatData({
    isEdit
  })
  const {removeAisles, updateSeats  , removeIsAllAisle , addAisles ,addIsAllAisle } = useSeatActions({isEdit})
  const rowConfigs = rowsConfigs[seatLabel];
  const seats = rowConfigs.seats;
  const aisles = rowConfigs.aisles;
  const totalMaxNumber = 20;
  const setAisles = useMemo(() => new Set(aisles), [aisles]);
  const isSeats = useMemo(() => {
    return Array.from({ length: seats + aisles.length }, (_, idx) =>
      setAisles.has(idx) ? false : true
    );
  }, [seats, aisles, setAisles]);

  const { isAisleInAllRows } = useIsAllAisles({isEdit});

  const handleOnClickSeatMinusBtn = () => {
    if (isSeats.length <= 1 || seats <= 1) {
      //seats의 최소 수
      return;
    }
    const lastIndex = isSeats.length - 1;
    if (setAisles.has(lastIndex)) {
      //마지막 seats를 제거할 때 통로였다면
      removeAisles(seatLabel, lastIndex);
    } else {
      //통로가 아니라면 , 즉 좌석이라면
      updateSeats(seatLabel,  seats - 1);
    }
    if (isAisleInAllRows(seatLabel, lastIndex, rowsConfigs)) {
      addIsAllAisle(lastIndex);
    }
  };

  const handleOnClickSeatPlsuBtn = () => {
    if (seats >= totalMaxNumber) {
      return;
    }
    const newSeatNum = seats + 1;
    if (isAllAisle.includes(newSeatNum)) {
      removeIsAllAisle(newSeatNum);
    }
    updateSeats(seatLabel, newSeatNum );
  };

  const handleOnToggleSeatItem = (index: number) => {
    if (!setAisles.has(index)) {
      //토글한 값이 false이면  즉 통로가 되면
      // 맨 뒤에 새 좌석 추가
      addAisles(seatLabel,  index )
      if (isAisleInAllRows(seatLabel, index , rowsConfigs)) {
        addIsAllAisle(index);
      }
    } else {
      if (isAllAisle.includes(index)) {
        removeIsAllAisle(index);
      }
      removeAisles(seatLabel, index);
    }
  };

  const renderSeats = () => {
    let seatNum = 0;
    return isSeats.map((seat, index) => {
      const isAisle = isAllAisle.includes(index);

      if (!isAisle) {
        seatNum++;
      }

      return (
        <SeatItem
          key={`${seatLabel}-${index}`}
          rowID={seatLabel}
          seatNumber={seat ? seatNum : null}
          isSeat={seat}
          onClick={() => handleOnToggleSeatItem(index)}
        />
      );
    });
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 w-fit">
        <span className="font-bold w-6">{seatLabel}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleOnClickSeatMinusBtn}
          disabled={isSeats.length <= 1}
        >
          <Minus className="w-3 h-3" />
        </Button>
        <span className="w-[2rem] flex-shrink-0 text-center">{seats}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleOnClickSeatPlsuBtn}
          disabled={seats >= totalMaxNumber}
        >
          <Plus className="w-3 h-3" />
        </Button>
        {renderSeats()}
      </div>
    </div>
  );
}
