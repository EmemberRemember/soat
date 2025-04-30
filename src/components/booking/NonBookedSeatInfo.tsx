"use client";
import React from "react";
import { PerformanceData } from "@/app/api/performance/route";

interface Props {
  selectedSeatLabel: string;
  performanceData?: PerformanceData;
  performanceDate: string;
  performanceTime: string;
}

export default function NonBookedSeatInfo({
  selectedSeatLabel,
  performanceData,
  performanceDate,
  performanceTime,
}: Props) {
  return (
    <article>
      <h2 className="text-2xl font-bold text-center">
        좌석 {selectedSeatLabel} 정보
      </h2>

      {/* 공연 정보 */}
      <section className="border-t-2 py-2">
        <h3 className="font-bold">공연 정보</h3>
        <dl className="flex flex-wrap items-center justify-center">
          <dt className="basis-[30%] text-gray-500 my-0.5">공연명</dt>
          <dd className="basis-[70%] my-0.5">{performanceData?.title}</dd>
          <dt className="basis-[30%] text-gray-500 my-0.5">공연 날짜</dt>
          <dd className="basis-[70%] my-0.5">{performanceDate}</dd>
          <dt className="basis-[30%] text-gray-500 my-0.5">공연 시간</dt>
          <dd className="basis-[70%] my-0.5">{performanceTime}</dd>
          <dt className="basis-[30%] text-gray-500 my-0.5">가격</dt>
          <dd className="basis-[70%] my-0.5">
            {performanceData?.price.toLocaleString()} 원
          </dd>
        </dl>
      </section>
    </article>
  );
}
