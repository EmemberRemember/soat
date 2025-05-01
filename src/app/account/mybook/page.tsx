"use client";
import { useEffect } from "react";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import ReservationListData from "@/components/account/ReservationListData";
import useBookingDetail from "@/hooks/useBookingDetail";

export default function Page({
  searchParams,
}: {
  searchParams: { book?: string };
}) {
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

  const book = searchParams.book || "total"; // 기본값 설정

  return (
    <>
      <Header />
      <main className={`m-auto w-full pt-[10px] px-[30px] sm:px-[0]`}>
        <section className="m-auto sm:w-[80%] mb-12 lg:pl-[26px]">
          <h2 className="my-[10px] sm:text-3xl sm:my-6 font-bold">
            {book === "past"
              ? "지난 예매 내역"
              : book === "upComing"
                ? "예정된 예매 내역"
                : "전체 예매 내역"}
          </h2>
          <ReservationListData
            data={
              book === "past"
                ? completedBookingData
                : book === "upComing"
                  ? upComingBookingData
                  : bookingData
            }
            isLoading={isLoading}
          />
        </section>
      </main>
      <Footer />
    </>
  );
}
