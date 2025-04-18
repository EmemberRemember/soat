"use client";
import React, { useMemo } from "react";
import SeatItem from "./SeatItem";
import { RowConfig } from "@/types/seat";
import { OccupiedSeat } from "@/types/performance";

interface SeatRowProps {
  seatLabel: string;
  rowConfigs: RowConfig;
  isAllAisle: number[];
  onClickSeatItem: (seatLabel: string, seatNumber: number) => void;
  occupiedSeat: OccupiedSeat[];
}

export default function SeatRow({
  seatLabel,
  rowConfigs,
  isAllAisle,
  onClickSeatItem,
  occupiedSeat,
}: SeatRowProps) {
  const seats = rowConfigs.seats;
  const aisles = rowConfigs.aisles;
  const setAisles = useMemo(() => new Set(aisles), [aisles]);
  const isSeats = useMemo(() => {
    return Array.from({ length: seats + aisles.length }, (_, idx) =>
      setAisles.has(idx) ? false : true
    );
  }, [seats, aisles, setAisles]);

  const handleOnClickSeatItem = (seatLabel: string, seatNumber: number) => {
    onClickSeatItem(seatLabel, seatNumber);
  };

  const renderSeats = () => {
    let seatNum = 0;
    return isSeats.map((seat, index) => {
      const isAisle = isAllAisle.includes(index);
      const currentSeatNum = !isAisle && seat ? ++seatNum : null;
      const seatId =
        seat && currentSeatNum ? `${seatLabel}${currentSeatNum}` : "";
      const matchedSeat = occupiedSeat?.find((s) => s.seatId === seatId);
      const status = matchedSeat?.status;

      return (
        <SeatItem
          key={`${seatLabel}-${index}`}
          rowID={seatLabel}
          seatNumber={seat ? currentSeatNum : null}
          isSeat={seat}
          status={status}
          onClick={() =>
            handleOnClickSeatItem(seatLabel, currentSeatNum as number)
          }
          disabled={!seat}
        />
      );
    });
  };

  return (
    <div className="flex items-center gap-2 w-fit">
      <span className="font-bold w-6">{seatLabel}</span>
      {renderSeats()}
    </div>
  );
}
