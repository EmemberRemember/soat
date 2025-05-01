"use client";
import React, { useState } from "react";
import ShowDetailArea from "./ShowDetailArea";
import ReviewArea from "./ReviewArea";
import CautionArea from "./CautionArea";
import { PerformanceData } from "@/app/api/performance/route";

export default function ShowDetailSection({
  performanceData,
}: {
  performanceData: PerformanceData;
}) {
  const [isTapState, setTapState] = useState("SHOWDETAIL");
  return (
    <section>
      <h2 className="sr-only">공연 정보</h2>
      <ul className="flex mb-12">
        {/* 공연정보 TAP일때 */}
        <li
          className={`w-1/3 border-b-2 text-center cursor-pointer py-1.5 ${
            isTapState === "SHOWDETAIL"
              ? "text-orange-500 border-orange-500"
              : "text-neutral-700 border-neutral-700"
          }`}
          onClick={() => {
            setTapState("SHOWDETAIL");
          }}
        >
          공연정보
        </li>

        {/* 한줄평 TAP일때 */}
        <li
          className={`w-1/3 border-b-2 text-center cursor-pointer py-1.5 ${
            isTapState === "REVIEW"
              ? "text-orange-500 border-orange-500"
              : "text-neutral-700 border-neutral-700"
          }`}
          onClick={() => {
            setTapState("REVIEW");
          }}
        >
          한줄평
        </li>

        {/* 유의사항 TAP일때 */}
        <li
          className={`w-1/3 border-b-2 text-center cursor-pointer py-1.5 ${
            isTapState === "CAUTION"
              ? "text-orange-500 border-orange-500"
              : "text-neutral-700 border-neutral-700"
          }`}
          onClick={() => {
            setTapState("CAUTION");
          }}
        >
          유의사항
        </li>
      </ul>

      {isTapState === "SHOWDETAIL" && (
        <ShowDetailArea performanceData={performanceData} />
      )}
      {isTapState === "REVIEW" && <ReviewArea setTapState={setTapState} />}
      {isTapState === "CAUTION" && <CautionArea />}
    </section>
  );
}
