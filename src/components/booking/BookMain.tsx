"use client";

import Captcha from "./Captcha";
import { useEffect, useState } from "react";
import SeatSelection from "./SeatSelection";
import PurchaserInfo from "./PurchaserInfo";
import PurchaseMethod from "./PurchaseMethod";
import BookComplete from "./BookComplete";
import type { TheaterLayoutData } from "@/components/seats/TheaterLayoutManager";
import { PerformanceData } from "@/app/api/performance/route";
import { SeatState } from "@/redux/slices/seatSlice";

export default function BookMain({
  showId,
  performanceData,
}: {
  showId: string;
  performanceData: PerformanceData;
}) {
  const [process, setProcess] = useState("captcha");
  const [_captchaToken, setCaptchaToken] = useState("");
  const [layoutData, setLayoutData] = useState({} as SeatState);
  const [selectedSeats, setSelectedSeats] = useState<Set<string>>(new Set());
  const [selectedDay, setSelectedDay] = useState("");
  const [purchaserInfo, setPurchaserInfo] = useState({} as any);

  useEffect(() => {
    setLayoutData(performanceData.seats);
  }, []);

  return (
    <main className="p-6 w-full flex flex-col items-center gap-y-8">
      {process === "captcha" && (
        <Captcha
          verifyCallback={setCaptchaToken}
          setProcess={setProcess}
          nextProcess="seat"
        />
      )}
      {process === "seat" && (
        <SeatSelection
          performanceId={showId}
          setProcess={setProcess}
          performanceDates={performanceData.performances}
          layoutData={layoutData}
          selectedSeats={selectedSeats}
          setSelectedSeats={setSelectedSeats}
          selectedDay={selectedDay}
          setSelectedDay={setSelectedDay}
        />
      )}
      {process === "purchaserInfo" && (
        <PurchaserInfo
          setProcess={setProcess}
          purchaserInfo={purchaserInfo}
          setPurchaserInfo={setPurchaserInfo}
        />
      )}
      {process === "purchaseMethod" && (
        <PurchaseMethod setProcess={setProcess} />
      )}
      {process === "bookComplete" && <BookComplete />}
    </main>
  );
}
