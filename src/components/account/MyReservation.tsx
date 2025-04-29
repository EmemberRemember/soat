"use client";
import { useEffect } from "react";
import useBookingDetail from "@/hooks/useBookingDetail";
import ReservationList from "./ReservationList";

export default function MyReservation() {
  const { bookingData, completedBookingData, isLoading, fetchAllBookings } =
    useBookingDetail();

  useEffect(() => {
    fetchAllBookings();
  }, [fetchAllBookings]);

  return (
    <div className="flex flex-col relative">
      <ReservationList data={bookingData} isLoading={isLoading} />
      <ReservationList
        data={completedBookingData}
        isPastData
        isLoading={isLoading}
      />
    </div>
  );
}
