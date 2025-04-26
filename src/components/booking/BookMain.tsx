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
import axios from "axios";
import { bookResultType } from "@/types/reservation";

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
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [purchaserInfo, setPurchaserInfo] = useState<{
    name: string;
    phone: string;
    email: string;
  }>({ name: "", phone: "", email: "" });
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  // bookResult를 useState로 관리
  const [bookResult, setBookResult] = useState<bookResultType | null>(null);

  useEffect(() => {
    setLayoutData(performanceData.seats);
  }, [performanceData.seats]);

  // 예매 완료 핸들러 구현
  async function bookCompleteHandler() {
    if (isBooking) return;
    setIsBooking(true);
    setBookingError(null);

    if (
      !showId ||
      !selectedDay ||
      !selectedTime ||
      selectedSeats.size === 0 ||
      !purchaserInfo.name ||
      !purchaserInfo.phone ||
      !purchaserInfo.email
    ) {
      setBookingError("필수 예매 정보가 누락되었습니다.");
      setIsBooking(false);
      return;
    }

    const bookingData = {
      performanceId: showId,
      selectedDay: selectedDay,
      selectedTime: selectedTime,
      selectedSeats: Array.from(selectedSeats),
      purchaserInfo: purchaserInfo,
      totalPrice: selectedSeats.size * performanceData.price,
    };

    try {
      const response = await axios.post("/api/reservation/book", bookingData);

      if (response.status === 201 && response.data.bookingResult) {
        console.log("Booking successful:", response.data.bookingResult);
        // setBookResult를 사용하여 상태 업데이트
        setBookResult(response.data.bookingResult);
        setProcess("bookComplete");
      } else {
        setBookingError(
          response.data.message || "예매 처리 중 문제가 발생했습니다."
        );
      }
    } catch (error: any) {
      console.error("Booking failed:", error);
      const message =
        error.response?.data?.message ||
        "예매 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
      setBookingError(message);
    } finally {
      setIsBooking(false);
    }
  }

  return (
    <main className="p-6 w-full flex flex-col items-center gap-y-8">
      {bookingError && (
        <div className="text-red-600 bg-red-100 p-3 rounded-md w-full max-w-2xl text-center">
          {bookingError}
        </div>
      )}

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
          selectedTime={selectedTime}
          setSelectedTime={setSelectedTime}
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
        <PurchaseMethod
          setProcess={setProcess}
          performanceName={performanceData.title}
          performanceDate={selectedDay}
          performanceTime={selectedTime}
          selectedSeats={selectedSeats}
          ticketPrice={performanceData.price}
          bookCompleteHandler={bookCompleteHandler}
          // isBooking={isBooking} // 필요시 전달
        />
      )}
      {/* bookResult 상태가 null이 아닐 때 BookComplete 렌더링 및 props 전개 */}
      {process === "bookComplete" && bookResult && (
        <BookComplete {...bookResult} />
      )}
    </main>
  );
}
