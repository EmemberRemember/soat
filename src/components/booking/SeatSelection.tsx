import { Button } from "../controls/Button";
import React, { useEffect, useState } from "react";
import BookSection from "./BookSection";
import TheaterSeatSelector from "../seats/TheaterSeatsSelector";
import type {
  OccupiedSeat,
  TheaterLayoutData,
} from "../seats/TheaterLayoutManager";
import { DailyPerformances } from "@/types/enrollment";
import { doc, onSnapshot, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import axios from "axios";

interface SeatData {
  seatId: string;
  occupantId: string;
  occupiedAt: string;
  status: "processing" | "pending" | "booked";
  reservationId: string;
}

function datesButton({
  date,
  highlight,
  setSelectedDay,
}: {
  date: string;
  highlight?: boolean;
  setSelectedDay: (date: string) => void;
}) {
  return (
    <li key={date}>
      <Button
        size="small"
        highlight={highlight}
        onClick={() => setSelectedDay(date)}
      >
        {date}
      </Button>
    </li>
  );
}

export default function SeatSelection({
  performanceDates,
  setProcess,
  layoutData,
  selectedSeats,
  setSelectedSeats,
  selectedDay,
  setSelectedDay,
  performanceId, // 공연 ID 추가
}: {
  performanceDates: DailyPerformances;
  setProcess: (process: string) => void;
  layoutData: TheaterLayoutData;
  selectedSeats: Set<string>;
  setSelectedSeats: (selectedSeats: Set<string>) => void;
  selectedDay: string;
  setSelectedDay: (selectedDay: string) => void;
  performanceId: string; // 공연 ID 추가
}) {
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("/api/account/me");
        const { user } = response.data;
        setUserId(user.id);
      } catch (error) {
        console.error("사용자 정보 조회 오류:", error);
      }
    };

    fetchUser();
  }, []);

  const [occupiedSeats, setOccupiedSeats] = useState<OccupiedSeat[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const maxSelectableSeats = 4;

  // 날짜와 시간이 선택되면 해당 공연의 점유 좌석 정보를 실시간으로 가져옴
  useEffect(() => {
    if (!selectedDay || !performanceId || !selectedTime) return;

    setIsLoading(true);

    const performanceRef = doc(db, "performances", performanceId);

    const unsubscribe = onSnapshot(performanceRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const performances = data.performances || {};

        const dayPerformances = performances[selectedDay] || [];
        const timePerformance = dayPerformances.find(
          (p: { time: string }) => p.time === selectedTime
        );

        if (timePerformance && timePerformance.occupiedSeats) {
          setOccupiedSeats(timePerformance.occupiedSeats);
        } else {
          setOccupiedSeats([]);
        }
      } else {
        setOccupiedSeats([]);
      }

      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [performanceId, selectedDay, selectedTime, performanceDates]);

  // 좌석 선택/해제 핸들러
  const handleSeatToggle = async (seatId: string) => {
    // 이미 점유된 좌석인지 확인
    const isOccupied = occupiedSeats.some((seat) => seat.seatId === seatId);
    const isMySeat =
      isOccupied &&
      occupiedSeats.some(
        (seat) => seat.seatId === seatId && seat.occupantId === userId
      );

    // 다른 사람이 점유한 좌석이면 선택 불가
    if (isOccupied && !isMySeat) {
      alert("이미 예약된 좌석입니다.");
      return;
    }

    const newSelected = new Set(selectedSeats);
    const performanceRef = doc(db, "performances", performanceId);

    try {
      // 현재 공연 정보 가져오기
      const docSnap = await getDoc(performanceRef);
      if (!docSnap.exists()) {
        alert("공연 정보를 찾을 수 없습니다.");
        return;
      }

      const data = docSnap.data();
      const performances = data.performances || {};
      const updatedPerformances = { ...performances };
      const dayPerformances = [...(updatedPerformances[selectedDay] || [])];
      const timeIndex = dayPerformances.findIndex(
        (p) => p.time === selectedTime
      );

      // 해당 시간대 공연이 없으면 새로 생성
      if (timeIndex === -1) {
        dayPerformances.push({
          time: selectedTime,
          casting: [],
          occupiedSeats: [],
        });
      }

      const currentTimeIndex =
        timeIndex === -1 ? dayPerformances.length - 1 : timeIndex;
      const updatedTimePerformance = { ...dayPerformances[currentTimeIndex] };
      const currentOccupiedSeats = updatedTimePerformance.occupiedSeats || [];

      // 좌석 선택/해제 처리
      if (newSelected.has(seatId) || isMySeat) {
        // 좌석 해제
        newSelected.delete(seatId);

        // Firestore에서도 해당 좌석 제거
        const updatedOccupiedSeats = currentOccupiedSeats.filter(
          (seat: SeatData) =>
            !(seat.seatId === seatId && seat.occupantId === userId)
        );

        updatedTimePerformance.occupiedSeats = updatedOccupiedSeats;
      } else {
        // 좌석 선택
        if (newSelected.size >= maxSelectableSeats) {
          alert(`최대 ${maxSelectableSeats}개의 좌석만 선택할 수 있습니다.`);
          return;
        }

        newSelected.add(seatId);

        // Firestore에 새 좌석 추가
        const reservationId = crypto.randomUUID();
        const newSeat = {
          seatId,
          occupantId: userId,
          occupiedAt: new Date().toLocaleString(),
          status: "processing" as const,
          reservationId,
        };

        updatedTimePerformance.occupiedSeats = [
          ...currentOccupiedSeats,
          newSeat,
        ];
      }

      // 업데이트된 공연 정보 저장
      dayPerformances[currentTimeIndex] = updatedTimePerformance;
      updatedPerformances[selectedDay] = dayPerformances;

      // Firestore 업데이트
      await updateDoc(performanceRef, {
        performances: updatedPerformances,
      });

      // 로컬 상태 업데이트
      setSelectedSeats(newSelected);
    } catch (error) {
      console.error("좌석 선택 중 오류 발생:", error);
      alert("좌석 선택 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  // 좌석 예약 처리 및 Firestore 업데이트
  const handleBooking = () => {
    if (selectedSeats.size === 0) {
      alert("좌석을 선택해주세요.");
      return;
    }
    setProcess("purchaserInfo");
  };

  // 시간대 선택 핸들러
  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  return (
    <>
      <BookSection>
        <h3 className="font-bold text-xl">1. 일자 및 좌석 선택</h3>
        <ul className="flex gap-x-3">
          {Object.keys(performanceDates)
            .sort()
            .map((e, index) => {
              return datesButton({
                date: e,
                highlight: selectedDay ? selectedDay === e : index === 0,
                setSelectedDay,
              });
            })}
        </ul>

        {/* 시간대 선택 UI */}
        {selectedDay && performanceDates[selectedDay] && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">시간 선택</h4>
            <ul className="flex gap-x-3">
              {performanceDates[selectedDay].sort().map((performance) => (
                <li key={performance.time}>
                  <Button
                    size="small"
                    highlight={selectedTime === performance.time}
                    onClick={() => handleTimeSelect(performance.time)}
                  >
                    {performance.time}
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {isLoading ? (
          <div className="w-full h-64 flex items-center justify-center">
            <p>일자를 선택해 주세요!</p>
          </div>
        ) : (
          <div className="w-full h-fit rounded-md shadow-sm border-2 mt-4">
            <TheaterSeatSelector
              layoutData={layoutData}
              occupiedSeats={occupiedSeats}
              selectedSeats={selectedSeats}
              onSeatToggle={handleSeatToggle}
              userId={userId}
            />
          </div>
        )}
      </BookSection>
      <ul className="w-full max-w-2xl">
        <li>
          <Button highlight className="w-full" onClick={handleBooking}>
            다음
          </Button>
        </li>
      </ul>
    </>
  );
}
