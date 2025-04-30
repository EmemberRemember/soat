"use client";
import React from "react";
import { Button } from "@/components/ui/button";
interface SeatItemProps {
  rowID: string;
  seatNumber: number | null;
  isSeat: boolean;
  onClick: () => void;
  status?: "processing" | "pending" | "booked" | "cancel" | "pendingRefund";
  disabled?: boolean;
}
export default function SeatItem({
  rowID,
  seatNumber,
  isSeat,
  onClick,
  disabled = false,
  status,
}: SeatItemProps) {
  const handleOnclickSeatItem = () => {
    onClick();
  };
  const getStatusClass = (
    status?: "processing" | "pending" | "booked" | "cancel" | "pendingRefund"
  ) => {
    switch (status) {
      case "booked":
        return "bg-red-500";
      case "pending":
        return "bg-yellow-400";
      case "processing":
        return "bg-blue-400";
      case "cancel":
        return "bg-gray-400";
      case "pendingRefund":
        return "bg-green-600";
      default:
        return "bg-gray-200"; // 예약 안 된 좌석
    }
  };
  return (
    <Button
      variant={isSeat ? "outline" : "ghost"}
      className={`w-6 h-6 p-1 text-xs  ${isSeat ? getStatusClass(status) : ""}`}
      onClick={handleOnclickSeatItem}
      disabled={disabled}
    >
      {seatNumber && rowID + seatNumber}
    </Button>
  );
}
