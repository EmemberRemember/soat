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
import BookedSeatInfo from "../booking/BookedSeatInfo";
import NonBookedSeatInfo from "../booking/NonBookedSeatInfo";

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

export interface BookResult extends bookResultType {
  bookingTimestamp: Timestamp;
}

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
          selectedSeatItem[0].status !== "processing" ? (
            bookingLoading ? (
              renderLoadingState()
            ) : (
              <BookedSeatInfo
                selectedSeatLabel={selectedSeatLabel}
                selectedSeatItem={selectedSeatItem[0]}
                performanceData={performanceData}
                performanceDate={performanceDate}
                performanceTime={performanceTime}
                bookingData={bookingData}
                bookingError={bookingError}
                performanceId={bookingData?.performanceId as string}
              />
            )
          ) : (
            <NonBookedSeatInfo
              selectedSeatLabel={selectedSeatLabel}
              performanceData={performanceData}
              performanceDate={performanceDate}
              performanceTime={performanceTime}
            />
          )}
        </>
      </Modal>
    </>
  );
}
