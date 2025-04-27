// src/components/booking/SeatSelection.tsx
import { Button } from "../controls/Button";
import React, { useEffect, useState } from "react";
import BookSection from "./BookSection";
import TheaterSeatSelector from "../seats/TheaterSeatsSelector";
import type {
  OccupiedSeat,
  TheaterLayoutData,
} from "../seats/TheaterLayoutManager";
import { DailyPerformances } from "@/types/enrollment";
import { doc, onSnapshot } from "firebase/firestore"; // getDoc, updateDoc 제거
import { db } from "@/lib/firebaseConfig";
import axios from "axios";
import { SeatState } from "@/redux/slices/seatSlice"; // axios import 확인

function datesButton({
  date,
  highlight,
  setSelectedDay,
  selectedTime,
  setSelectedTime,
}: {
  date: string;
  highlight?: boolean;
  setSelectedDay: (date: string) => void;
  selectedTime: string;
  setSelectedTime: (time: string) => void;
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
  selectedTime,
  setSelectedTime,
  performanceId,
}: {
  performanceDates: DailyPerformances;
  setProcess: (process: string) => void;
  layoutData: SeatState;
  selectedSeats: Set<string>;
  setSelectedSeats: (selectedSeats: Set<string>) => void;
  selectedDay: string;
  setSelectedDay: (selectedDay: string) => void;
  selectedTime: string;
  setSelectedTime: (selectedTime: string) => void;
  performanceId: string;
}) {
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("/api/account/me");
        const { user } = response.data;
        if (user && user.id) {
          setUserId(user.id);
        }
      } catch (error) {
        console.error("사용자 정보 조회 오류:", error);
      }
    };

    fetchUser();
  }, []);

  const [occupiedSeats, setOccupiedSeats] = useState<OccupiedSeat[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const maxSelectableSeats = 4;

  useEffect(() => {
    if (!selectedDay || !selectedTime || !performanceId) {
      setOccupiedSeats([]);
      setSelectedSeats(new Set()); // 날짜/시간 미선택 시 선택 좌석 초기화
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const performanceRef = doc(db, "performances", performanceId);

    const unsubscribe = onSnapshot(
      performanceRef,
      (docSnap) => {
        let currentOccupiedSeats: OccupiedSeat[] = [];
        let userProcessingSeats = new Set<string>();

        if (docSnap.exists()) {
          const data = docSnap.data();
          const performances = data.performances || {};
          const dayPerformances = performances[selectedDay] || [];
          const timePerformance = dayPerformances.find(
            (p: { time: string }) => p.time === selectedTime
          );

          if (timePerformance && timePerformance.occupiedSeats) {
            currentOccupiedSeats = timePerformance.occupiedSeats;

            // userId가 있고, 점유 좌석 정보가 있을 때만 실행
            if (userId) {
              // 현재 사용자가 'processing' 상태로 점유 중인 좌석 ID들을 찾음
              const processingSeatIds = currentOccupiedSeats
                .filter(
                  (seat) =>
                    seat.occupantId === userId && seat.status === "processing"
                )
                .map((seat) => seat.seatId);
              userProcessingSeats = new Set(processingSeatIds);
            }
          }
        } else {
          console.log("Performance document not found!");
        }

        setOccupiedSeats(currentOccupiedSeats); // 전체 점유 좌석 상태 업데이트
        setSelectedSeats(userProcessingSeats); // 사용자의 processing 좌석으로 selectedSeats 업데이트
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching seat snapshot:", error);
        setIsLoading(false);
        setOccupiedSeats([]);
        setSelectedSeats(new Set()); // 오류 발생 시 초기화
      }
    );

    return () => unsubscribe();
    // userId를 의존성 배열에 추가하여 userId가 설정된 후 스냅샷 리스너가 데이터를 처리하도록 함
  }, [performanceId, selectedDay, selectedTime, userId, setSelectedSeats]);

  const handleSeatToggle = async (seatId: string) => {
    if (isUpdating) return;
    if (!userId) {
      alert("로그인이 필요합니다.");
      return;
    }
    if (!selectedDay || !selectedTime) {
      alert("날짜와 시간을 먼저 선택해주세요.");
      return;
    }

    const isCurrentlySelected = selectedSeats.has(seatId);
    const seatInfo = occupiedSeats.find((seat) => seat.seatId === seatId);
    const isOccupiedByOther =
      seatInfo &&
      seatInfo.occupantId !== userId &&
      seatInfo.status !== "processing"; // 다른 사람의 processing 좌석도 선택 불가

    if (isOccupiedByOther) {
      alert("이미 다른 사용자가 선택했거나 예매 중인 좌석입니다.");
      return;
    }

    const action = isCurrentlySelected ? "deselect" : "select";

    if (action === "select" && selectedSeats.size >= maxSelectableSeats) {
      alert(`최대 ${maxSelectableSeats}개의 좌석만 선택할 수 있습니다.`);
      return;
    }

    setIsUpdating(true);

    try {
      const response = await axios.post("/api/reservation/update-seat", {
        performanceId,
        day: selectedDay,
        time: selectedTime,
        seatId,
        action,
      });

      if (!response.data.success) {
        console.error("Failed to update seat:", response.data.message);
        alert(response.data.message || "좌석 업데이트에 실패했습니다.");
        // 실패 시 Firestore 리스너가 최신 상태를 반영하므로 별도 롤백 불필요
      }
      // 성공 시 Firestore 리스너가 자동으로 상태를 업데이트하므로
      // 여기서 setSelectedSeats를 직접 호출하지 않아도 됩니다.
      // (호출하면 Firestore 업데이트와 충돌 가능성 있음)
    } catch (error: any) {
      console.error("Error calling update-seat API:", error);
      const message =
        error.response?.data?.message ||
        "좌석 업데이트 중 오류가 발생했습니다. 다시 시도해주세요.";
      alert(message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleBooking = () => {
    if (selectedSeats.size === 0) {
      alert("좌석을 선택해주세요.");
      return;
    }
    setProcess("purchaserInfo");
  };

  const handleTimeSelect = (time: string) => {
    // 시간 변경 시 선택된 좌석은 useEffect에서 Firestore 데이터 기준으로 자동 업데이트됨
    setSelectedTime(time);
    // setSelectedSeats(new Set()); // 수동 초기화 제거
  };

  const handleDaySelect = (date: string) => {
    setSelectedDay(date);
    setSelectedTime("");
    // setSelectedSeats(new Set()); // 수동 초기화 제거
    setOccupiedSeats([]);
    setIsLoading(true);
  };

  return (
    <>
      <BookSection>
        <h3 className="font-bold text-xl">1. 일자 및 좌석 선택</h3>
        {/* 날짜 선택 UI */}
        <ul className="flex gap-x-3 flex-wrap">
          {Object.keys(performanceDates)
            .sort()
            .map((date) => (
              <li key={date} className="mb-2">
                <Button
                  size="small"
                  highlight={selectedDay === date}
                  onClick={() => handleDaySelect(date)}
                >
                  {date}
                </Button>
              </li>
            ))}
        </ul>

        {/* 시간대 선택 UI */}
        {selectedDay && performanceDates[selectedDay] && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">시간 선택</h4>
            <ul className="flex gap-x-3 flex-wrap">
              {performanceDates[selectedDay]
                .sort((a, b) => a.time.localeCompare(b.time))
                .map((performance) => (
                  <li key={performance.time} className="mb-2">
                    <Button
                      size="small"
                      highlight={selectedTime === performance.time}
                      onClick={() => handleTimeSelect(performance.time)}
                      disabled={isUpdating}
                    >
                      {performance.time}
                    </Button>
                  </li>
                ))}
            </ul>
          </div>
        )}

        {/* 좌석 선택 영역 */}
        {selectedDay && selectedTime ? (
          isLoading ? (
            <div className="w-full h-64 flex items-center justify-center">
              <p>좌석 정보를 불러오는 중...</p>
            </div>
          ) : (
            <div className="w-full h-fit rounded-md shadow-sm border-2 mt-4">
              <TheaterSeatSelector
                layoutData={layoutData}
                occupiedSeats={occupiedSeats}
                selectedSeats={selectedSeats} // Firestore 기반으로 업데이트된 selectedSeats 전달
                onSeatToggle={handleSeatToggle}
                userId={userId}
                disabled={isUpdating}
              />
            </div>
          )
        ) : (
          <div className="w-full h-64 flex items-center justify-center mt-4 border-2 rounded-md">
            <p>관람할 날짜와 시간을 선택해주세요.</p>
          </div>
        )}
      </BookSection>
      <ul className="w-full max-w-2xl mt-4">
        <li>
          <Button
            highlight
            className="w-full"
            onClick={handleBooking}
            disabled={selectedSeats.size === 0 || isUpdating}
          >
            다음
          </Button>
        </li>
      </ul>
    </>
  );
}
