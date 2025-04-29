"use client";
import { RowConfigs } from "@/types/seat";
import React, { useEffect, useState } from "react";
import SeatRow from "./SeatRow";
import { useShowModal } from "@/hooks/useShowModal";
import Modal from "../Modal";
import { OccupiedSeat } from "@/types/performance";
import { PerformanceData } from "@/app/api/performance/route";
import { bookResultType } from "@/types/reservation";
import { Timestamp } from "firebase/firestore";
import { CloseButton } from "../controls/Button";
import Loading from "../Loading";

interface SeatLayoutProps {
  rows: number;
  totalSeats: number;
  rowsConfigs: RowConfigs;
  isAllAisle: number[];
  occupiedSeat?: OccupiedSeat[];
  performanceData?: PerformanceData;
  performanceTime: string;
  performanceDate: string;
}

interface BookResult extends bookResultType {
  bookingTimestamp: Timestamp;
}

const BookingStatus = {
  processing: "예매중",
  pending: "입금 대기",
  booked: "입금 완료",
};

export default function SeatLayout({
  rowsConfigs,
  isAllAisle,
  occupiedSeat,
  performanceData,
  performanceTime,
  performanceDate,
}: SeatLayoutProps) {
  const [selectedSeatLabel, setSelectedSeatLabel] = useState<string>("");
  const [bookingData, setBookingData] = useState<BookResult | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const { showModal, handleShowModal } = useShowModal();
  const selectedSeatItem = occupiedSeat?.filter(
    (seatItem) => seatItem.seatId === selectedSeatLabel
  );
  const isBooked = occupiedSeat?.some(
    (seatItem) => seatItem.seatId === selectedSeatLabel
  );
  const bookingStatus = selectedSeatItem?.[0]?.status;
  const selectedReservationId =
    isBooked && selectedSeatItem?.[0]?.reservationId;

  const fetchReservationData = async (reservationId: string) => {
    if (!reservationId) return;

    try {
      setBookingLoading(true);
      const response = await fetch(`/api/reservation/book/${reservationId}`, {
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "예약 정보를 불러오는데 실패했습니다."
        );
      }

      const data = await response.json();
      setBookingData(data.bookingData);
    } catch (error) {
      console.error("예약 정보 로딩 오류:", error);
      if (error instanceof Error) {
        setBookingError(error.message);
        setBookingData(null);
      }
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCloseModal = () => {
    handleShowModal(false);
    setSelectedSeatLabel("");
  };

  const handleClickSeat = (seatLabel: string, seatNumber: number) => {
    setSelectedSeatLabel(`${seatLabel}${seatNumber}`);
    handleShowModal(true);
  };

  const renderRows = () => {
    return Object.keys(rowsConfigs).map((rowsLabel, index) => {
      return (
        <SeatRow
          key={index}
          seatLabel={rowsLabel}
          rowConfigs={rowsConfigs[rowsLabel]}
          isAllAisle={isAllAisle}
          onClickSeatItem={handleClickSeat}
          occupiedSeat={occupiedSeat}
        />
      );
    });
  };

  const errorInfo = () => {
    return (
      <section className="border-t-2 py-2">
        <h3 className="font-bold">Error</h3>
        <p>{bookingError}</p>
      </section>
    );
  };

  const renderBookedSeatInfo = () => {
    if (selectedSeatItem == undefined) {
      return;
    }

    return (
      <article>
        <h2 className="text-2xl font-bold text-center">
          좌석 {selectedSeatLabel} 정보
        </h2>
        <dl className="flex flex-wrap py-2">
          <dt className="basis-[30%] text-gray-500">예매번호 :</dt>
          <dd className="font-bold basis-[70%] break-all">
            {selectedSeatItem[0].reservationId}
          </dd>
        </dl>
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
        {bookingError != null ? (
          errorInfo()
        ) : (
          <>
            <section className="border-t-2 py-2">
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
                  {bookingData?.selectedSeats.filter(
                    (seatlabel) => seatlabel !== selectedSeatLabel
                  )}
                </dd>
              </dl>
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
  };

  const renderNonBookedSeatInfo = () => {
    return (
      <article>
        <h2 className="text-2xl font-bold text-center mb-2">
          좌석 {selectedSeatLabel} 정보
        </h2>
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
  };

  const renderLoadingState = () => {
    return <Loading />;
  };

  // useEffect 수정
  useEffect(() => {
    console.log(bookingStatus);
    if (
      showModal &&
      isBooked &&
      selectedReservationId &&
      bookingStatus !== "processing"
    ) {
      fetchReservationData(selectedReservationId);
    } else {
      // Modal이 닫힐 때 데이터 초기화
      setBookingData(null);
      setBookingError(null);
    }
  }, [showModal, isBooked, selectedReservationId]);

  return (
    <>
      <div className="w-full bg-gray-300 h-8 rounded-lg flex items-center justify-center text-sm text-gray-600 mb-4">
        무대
      </div>
      <div className="flex gap-4 flex-col m-auto">{renderRows()}</div>
      <Modal
        className="flex flex-col"
        isOpen={showModal}
        onClose={handleCloseModal}
      >
        <>
          <CloseButton className="py-2 ml-auto" onClick={handleCloseModal} />
          {isBooked &&
          selectedSeatItem &&
          selectedSeatItem[0].status !== "processing"
            ? bookingLoading
              ? renderLoadingState()
              : renderBookedSeatInfo()
            : renderNonBookedSeatInfo()}
        </>
      </Modal>
    </>
  );
}
