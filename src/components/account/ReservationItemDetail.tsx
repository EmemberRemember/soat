"use client";
import React, { useState, useEffect } from "react";
import { Button } from "../controls/Button";
import axios from "axios";
import { bookWithPerformance } from "@/types/reservation";
import Loading from "../Loading";
interface DetailDataProps {
  label: string;
  data: string;
}

function BookingDataLi({ label, data }: DetailDataProps) {
  return (
    <li className="flex gap-2 mb-1">
      <p className="flex-1 whitespace-nowrap font-bold text-flesh-500">
        {label}
      </p>
      <span className="flex-[3] sm:flex-[2]">{data}</span>
    </li>
  );
}

function PaymentDataLi({ label, data }: DetailDataProps) {
  return (
    <li className="flex gap-2 mb-1 whitespace-nowrap">
      <p className="flex-[1] font-bold text-flesh-500">{label}</p>
      <span className="flex-[3] sm:flex-[1] sm:text-end">{data}</span>
    </li>
  );
}

const handleCancelBooking = (e: React.MouseEvent<HTMLButtonElement>) => {
  console.log("예매 취소!");
};

export default function ReservationItemDetail({ bookId }: { bookId: string }) {
  const [detailData, setDetailData] = useState<bookWithPerformance | null>(
    null
  );

  useEffect(() => {
    async function fetchDetailData() {
      try {
        const response = await axios.get(`/api/account/book/${bookId}`);
        setDetailData(response.data.booking);
        console.log(response.data.booking);
      } catch (error) {
        console.error("Error fetching booking details:", error);
      }
    }

    fetchDetailData();
  }, []);
  const paymentStatus =
    detailData?.paymentStatus === "pending" ? "미입금" : "결제 완료";
  const isPerformanceEnded =
    detailData && new Date(detailData.performanceDate) < new Date();
  return (
    <>
      {detailData ? (
        <>
          <section className="relative border-b-2">
            <h2 className="sm:text-xl md:text-2xl sm:font-bold">예매 내역</h2>
            <ul className="absolute top-0 right-0 text-xs flex gap-2">
              <li>
                <Button
                  onClick={(e) => handleCancelBooking(e)}
                  className="font-normal py-[2.5px] py-4 sm:text-base sm:font-bold"
                  disabled={isPerformanceEnded as boolean}
                >
                  예매 취소
                </Button>
              </li>
              <li>
                <Button
                  highlight
                  href="/demo/ticket"
                  className="font-normal py-[2.5px] py-4 sm:text-base sm:font-bold"
                >
                  QR 확인
                </Button>
              </li>
            </ul>
            <div className="flex items-center gap-6 my-4">
              <img
                src={detailData.performanceDetails.poster}
                alt={detailData.performanceDetails.title + "포스터"}
                className={`bg-flesh-500 rounded-[10px] mb-1 aspect-[90/130] object-cover w-full max-w-[90px] sm:w-[45%] sm:max-w-full  `}
              />
              <ul className="text-xs w-full sm:text-base md:text-xl ">
                <BookingDataLi label="예매번호" data={detailData.bookingId} />
                <BookingDataLi
                  label="공연명"
                  data={detailData.performanceDetails.title}
                />
                <BookingDataLi label="연령 제한" data="전체 관람가" />
                <BookingDataLi
                  label="공연 장소"
                  data={detailData.performanceDetails.address}
                />
                <BookingDataLi
                  label="공연 일시"
                  data={
                    detailData.performanceDate +
                    " " +
                    detailData.performanceTime
                  }
                />
                <BookingDataLi
                  label="좌석 번호"
                  data={detailData.selectedSeats.join(", ")}
                />
              </ul>
            </div>
            <h3 className="text-xs sm:font-bold sm:text-base md:text-lg">
              [안내 사항]
            </h3>
            <p className="text-[10px] text-gray-300 mb-[11px] sm:text-base sm:text-gray-500 md:text-lg">
              안전하고 즐거운 공연 관람을 위해 최선을 다하겠습니다 :)
            </p>
            <ul className="text-[10px] mb-4 list-disc ml-4 sm:text-base md:text-lg">
              <li>
                공연장 도착은 30분전, 예매한 좌석에 10분 전까지 착석해주세요.
              </li>
              <li>공연장 내에서 음식물 섭취가 불가능 합니다.</li>
              <li>
                관람 내용에 따라 관람 연령 제한이 있습니다. 관람 연령 제한으로
                인한 당일 티켓 환불은 어려우니 미리 확인해 주시기 바랍니다.
              </li>
              <li>
                19세 이상 관람 제한 공연 관람객은 신분증을 꼭 챙겨 주시기
                바랍니다.
              </li>
              <li>
                관람 시 다른사람에게 불쾌감을 주는 행위를 하는 경우, 공연에 방해
                되는 행위를 하는 경우 직원의 안내에 따라 퇴장 조치 될 수
                있습니다.
              </li>
              <li>
                비상 시 침착하게 직원의 안내에 따라 질서있게 대피해 주세요.
              </li>
            </ul>
          </section>
          <section>
            <h2 className="my-4 sm:text-xl md:text-2xl sm:my-6 sm:font-bold">
              결제 내역
            </h2>
            <ul className="text-xs sm:text-base md:text-xl">
              <PaymentDataLi label="결제 번호" data="20250403001AQTFZ003" />
              <PaymentDataLi label="결제 수단" data="무통장 입금" />
              <PaymentDataLi label="결제 확인" data={paymentStatus} />
              <PaymentDataLi
                label="송금 기한"
                data={
                  new Date(detailData.dueDate)
                    .toLocaleTimeString("ko-KR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })
                    .replace(":", "시 ") + "분까지"
                }
              />
            </ul>
            <p className="text-[10px] text-flesh-500 sm:text-base md:text-lg">
              * 입금기한 내에 입금이 되지 않을 경우 티켓이 취소되니
              주의바랍니다.
            </p>
          </section>
        </>
      ) : (
        <Loading />
      )}
    </>
  );
}
