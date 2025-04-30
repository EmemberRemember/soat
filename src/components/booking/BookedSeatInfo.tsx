"use client";
import React, { useState } from "react";
import { bookResultType } from "@/types/reservation";
import { PerformanceData } from "@/app/api/performance/route";
import BookingErrorInfo from "./BookingErrorInfo";
import { OccupiedSeat } from "@/types/performance";
import { Button } from "../controls/Button";
import axios from "axios";
import Loading from "../Loading";

interface Props {
  selectedSeatLabel: string;
  selectedSeatItem: OccupiedSeat;
  performanceData?: PerformanceData;
  performanceDate: string;
  performanceTime: string;
  bookingData: bookResultType | null;
  bookingError: string | null;
  performanceId: string;
}

const BookingStatus = {
  processing: "예매중",
  pending: "입금 대기",
  booked: "입금 완료",
  cancel: "예약 취소",
  pendingRefund: "환불 대기",
};

export default function BookedSeatInfo({
  selectedSeatLabel,
  selectedSeatItem,
  performanceData,
  performanceDate,
  performanceTime,
  bookingData,
  bookingError,
  performanceId,
}: Props) {
  const [loading, setLoading] = useState<boolean>(false);

  const putReservationStatus = async (
    reservationId: string,
    performanceId: string,
    status: "booked" | "pending",
    performanceDate: string,
    performanceTime: string
  ) => {
    try {
      setLoading(true);
      const response = await axios.put(
        `/api/reservation/book/${reservationId}`, // API 엔드포인트 URL
        {
          performanceId: performanceId, // 요청 본문에 데이터 포함
          status: status,
          performanceDate: performanceDate,
          performanceTime: performanceTime,
        },
        {
          headers: {
            "Content-Type": "application/json", // 요청 헤더 설정 (JSON 형식으로 데이터 전송)
          },
        }
      );

      console.log("입금 상태 변경 성공:", response.data);
      return response.data; // 성공 시 응답 데이터 반환 (선택 사항)
    } catch (error) {
      console.error("입금 상태 변경 실패:", error); // 에러를 다시 던져서 호출하는 쪽에서 처리하도록 함
    } finally {
      setLoading(false);
    }
  };

  const handleOnClickUpdateReservationStatus = async () => {
    const reservationId = selectedSeatItem.reservationId;
    const status = "booked";
    const data = await putReservationStatus(
      reservationId,
      performanceId,
      status,
      performanceDate,
      performanceTime
    );
  };

  return (
    <article className="relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        {loading && <Loading />}
      </div>
      <h2 className="text-2xl font-bold text-center">
        좌석 {selectedSeatLabel} 정보
      </h2>

      <dl className="flex flex-wrap py-2">
        <dt className="basis-[30%] text-gray-500">예매번호 :</dt>
        <dd className="font-bold basis-[70%] break-all">
          {selectedSeatItem.reservationId}
        </dd>
      </dl>

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

      {bookingError ? (
        <BookingErrorInfo bookingError={bookingError} />
      ) : (
        <>
          <section className="border-t-2 py-2 relative">
            <h3 className="font-bold">예약 정보</h3>
            <dl className="flex flex-wrap items-center justify-center">
              <dt className="basis-[30%] text-gray-500 my-0.5">예약자명</dt>
              <dd className="basis-[70%] my-0.5">
                {bookingData?.purchaserInfo.name}
              </dd>
              <dt className="basis-[30%] text-gray-500 my-0.5">이메일</dt>
              <dd className="basis-[70%] my-0.5">
                {bookingData?.purchaserInfo.email}
              </dd>
              <dt className="basis-[30%] text-gray-500 my-0.5">연락처</dt>
              <dd className="basis-[70%] my-0.5">
                {bookingData?.purchaserInfo.phone}
              </dd>
              <dt className="basis-[30%] text-gray-500 my-0.5">예약 상태</dt>
              <dd className="basis-[70%] my-0.5">
                {bookingData?.paymentStatus &&
                  BookingStatus[
                    bookingData.paymentStatus as keyof typeof BookingStatus
                  ]}
              </dd>
              <dt className="basis-[30%] text-gray-500 my-0.5">
                추가 예약 좌석
              </dt>
              <dd className="basis-[70%] my-0.5">
                {bookingData?.selectedSeats
                  .filter((seat) => seat !== selectedSeatLabel)
                  .join(", ")}
              </dd>
            </dl>
            <Button
              className="absolute bottom-2 right-0"
              type="button"
              onClick={handleOnClickUpdateReservationStatus}
            >
              예약 상태 변경
            </Button>
          </section>

          <section className="border-t-2 py-2">
            <h3 className="font-bold">결제 정보</h3>
            <dl className="flex flex-wrap items-center justify-center">
              <dt className="basis-[30%] my-0.5">총 결제 금액</dt>
              <dd className="basis-[70%] my-0.5 text-right font-bold">
                {bookingData?.totalPrice.toLocaleString()} 원
              </dd>
            </dl>
          </section>
        </>
      )}
    </article>
  );
}
