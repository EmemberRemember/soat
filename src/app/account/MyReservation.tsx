"use client"
import { useEffect } from "react";
import { Button } from "@/components/controls/Button";
import ReservationListData from "@/components/account/ReservationItem";
import { bookWithPerformance } from "@/types/reservation";
import useBookingDetail from "@/hooks/useBookingDetail";

export default function MyReservation() {
const { bookingData, completedBookingData, isLoading, fetchAllBookings } = useBookingDetail();

useEffect(() => {
  fetchAllBookings();
}, [fetchAllBookings]);

  return (
    <div className="flex flex-col relative">
      <ReservationList data={bookingData}/>
      <ReservationList data={completedBookingData} isPastData/>
    </div>
  );
}


function ReservationList({ data, isPastData }: { data: bookWithPerformance[], isPastData ?: boolean }) {

  return (
    <section className="max-w-[1000px] relative sm:col-span-2 sm:row-start-1 w-full min-w-[290px] flex-1 sm:ml-6">
      <h2 className="my-[10px] text-sm sm:text-3xl sm:my-6 font-bold">
        {isPastData ? "지난 예매 내역" : "예매 내역"}
      </h2>
      <Button
        type="button"
        size="small"
        highlight
        className="rounded-[30px] py-[2.5px] px-[13px] absolute top-2 right-0 sm:right-6 2xl:right-0 sm:text-base sm:font-bold sm:top-6"
        href={isPastData ? "/account/mybook?book=past" : "/account/mybook?book=total"}
      >
        더보기
      </Button>
      <ReservationListData slice={3} data={data} />
    </section>
  );
}
