"use client";
import { useEffect } from "react";
import useBookingDetail from "@/hooks/useBookingDetail";
import ReservationList from "./ReservationList";

export default function MyReservation() {
  const {
    bookingData,
    upComingBookingData,
    completedBookingData,
    isLoading,
    fetchAllBookings,
  } = useBookingDetail();

  useEffect(() => {
    fetchAllBookings();
  }, [fetchAllBookings]);

  return (
    <div className="flex flex-col relative">
      <ReservationList data={upComingBookingData} isLoading={isLoading} />
      <ReservationList
        data={completedBookingData}
        isPastData
        isLoading={isLoading}
      />
    </div>
  );
}
