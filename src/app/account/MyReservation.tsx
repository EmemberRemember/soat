"use client"
import React,{ useEffect, useState } from "react";
import { Button } from "@/components/controls/Button";
import ReservationListData from "@/components/account/ReservationItem";
import { bookWithPerformance } from "@/types/reservation";
import axios from "axios";

export default function MyReservation() {
const [bookingData, setBookingData] = useState<bookWithPerformance[]>([])
const [completedBookingData, setCompletedBookingData] = useState<bookWithPerformance[]>([])

  useEffect(() => {
    async function fetchBookingData(){
      const response = await axios.get('/api/account/book');
      const data = response.data.reservations
      const now = new Date();
      setBookingData(data)
      setCompletedBookingData(data.filter((bookData : bookWithPerformance)=>{
        return now < new Date(`${bookData.performanceDate}T${bookData.performanceTime}:00`)
      }))
    }
    fetchBookingData();
  }, [])

  return (
    <>
      <ReservationList data={bookingData}/>
      <BeforeReservationList data={completedBookingData}/>
    </>
  );
}


function ReservationList({ data }: { data: bookWithPerformance[] }) {
  return (
    <section className="max-w-[1000px] relative sm:col-span-2 sm:row-start-1 sm:mr-6 md:mx-6">
      <h2 className="my-[10px] text-sm sm:text-3xl sm:my-6 font-bold">
        예매 내역
      </h2>
      <Button
        type="button"
        size="small"
        highlight={true}
        className="rounded-[30px] py-[2.5px] px-[13px] bg-flesh-500 absolute top-2 right-0 sm:text-base sm:font-bold sm:top-6"
        href="/account/mybook?book=total"
      >
        더보기
      </Button>
      <ReservationListData slice={3} data={data} />
    </section>
  );
}

function BeforeReservationList({ data }: { data: bookWithPerformance[] }) {
  return (
    <>
      <section className="max-w-[1000px] relative sm:col-span-2 sm:row-start-2 sm:mr-6 md:mx-6">
        <h2 className="my-[10px] text-sm sm:text-3xl sm:my-6 font-bold">
          지난 예매 내역
        </h2>
        <Button
          type="button"
          size="small"
          highlight={true}
          className="rounded-[30px] py-[2.5px] px-[13px] bg-flesh-500 absolute top-2 right-0 sm:text-base sm:font-bold sm:top-6"
          href="/account/mybook?book=past"
        >
          더보기
        </Button>
        <ReservationListData slice={3} data={data}/>
      </section>
    </>
  );
}

