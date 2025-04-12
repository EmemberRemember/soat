"use client";
import { RowConfigs } from "@/types/seat";
import React, { useState } from "react";
import SeatRow from "./SeatRow";
import { useShowModal } from "@/hooks/useShowModal";
import Modal from "../Modal";
import { OccupiedSeat } from "@/types/performance";
interface SeatLayoutProps {
  rows: number;
  totalSeats: number;
  rowsConfigs: RowConfigs;
  isAllAisle: number[];
  occupiedSeat: OccupiedSeat[];
}
export default function SeatLayout({
  rows,
  totalSeats,
  rowsConfigs,
  isAllAisle,
  occupiedSeat,
}: SeatLayoutProps) {
  const [selectedSeatItem, setSelectedSeatItem] = useState<null | {
    seatLabel: string;
    seatNumber: number;
  }>(null);
  const { showModal, handleShowModal } = useShowModal();

  const handleClickSeat = (seatLabel: string, seatNumber: number) => {
    setSelectedSeatItem({ seatLabel: seatLabel, seatNumber: seatNumber });
    handleShowModal(true);
  };

  const renderRows = () => {
    return Object.keys(rowsConfigs).map((rowsLabel, index) => {
      return (
        <SeatRow
          key={index}
          seatLabel={rowsLabel}
          rowConfigs={rowsConfigs[rowsLabel]}
          isAllAisle={isAllAisle}
          onClickSeatItem={handleClickSeat}
          occupiedSeat={occupiedSeat}
        />
      );
    });
  };

  return (
    <>
      <div className="w-full bg-gray-300 h-8 rounded-lg flex items-center justify-center text-sm text-gray-600 mb-4">
        무대
      </div>
      <div className="flex gap-4 flex-col m-auto">{renderRows()}</div>
      <Modal isOpen={showModal} onClose={() => handleShowModal(false)}>
        <h2>
          {`${selectedSeatItem?.seatLabel}${selectedSeatItem?.seatNumber} 좌석 현황`}
        </h2>
      </Modal>
    </>
  );
}
