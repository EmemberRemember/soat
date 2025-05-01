import React from "react";
import { Button } from "@/components/controls/Button";
import ReservationListData from "./ReservationListData";
import { bookWithPerformance } from "@/types/reservation";

interface ReservationDataProps {
  data: bookWithPerformance[];
  isPastData?: boolean;
  isLoading: boolean;
}

export default function ReservationList({
  data,
  isPastData,
  isLoading,
}: ReservationDataProps) {
  return (
    <section className="max-w-[1000px] relative sm:col-span-2 sm:row-start-1 min-w-[290px] ">
      <h2 className="my-[10px] text-sm sm:text-3xl sm:my-6 font-bold">
        {isPastData ? "지난 예매 내역" : "예정된 예매 내역"}
      </h2>
      <Button
        type="button"
        size="small"
        highlight
        className="rounded-[30px] py-[2.5px] px-[13px] absolute top-2 right-0 sm:text-base sm:font-bold sm:top-6"
        href={
          isPastData
            ? "/account/mybook?book=past"
            : "/account/mybook?book=upComing"
        }
      >
        더보기
      </Button>
      <ReservationListData slice={3} data={data} isLoading={isLoading} />
    </section>
  );
}
