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
  performanceId,
}: {
  performanceDates: DailyPerformances;
  setProcess: (process: string) => void;
  layoutData: SeatState;
  selectedSeats: Set<string>;
  setSelectedSeats: (selectedSeats: Set<string>) => void;
  selectedDay: string;
  setSelectedDay: (selectedDay: string) => void;
  performanceId: string;
}) {
  // userId 상태는 TheaterSeatSelector에 전달하기 위해 유지할 수 있습니다.
  // API 호출 시에는 서버에서 인증된 사용자 ID를 사용합니다.
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
        // 사용자 정보를 가져오지 못했을 때의 처리 (예: 로그인 페이지로 리디렉션)
      }
    };

    fetchUser();
  }, []);

  const [occupiedSeats, setOccupiedSeats] = useState<OccupiedSeat[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false); // API 호출 중 상태

  const maxSelectableSeats = 4; // 최대 선택 가능 좌석 수 (클라이언트 측 검증용)

  // 날짜와 시간이 선택되면 해당 공연의 점유 좌석 정보를 실시간으로 가져옴 (기존 로직 유지)
  useEffect(() => {
    // 선택된 날짜나 시간이 없거나, 공연 ID가 없으면 실행 중단
    if (!selectedDay || !selectedTime || !performanceId) {
      setOccupiedSeats([]); // 좌석 정보 초기화
      setIsLoading(false); // 로딩 상태 해제
      return;
    }

    setIsLoading(true);
    const performanceRef = doc(db, "performances", performanceId);

    const unsubscribe = onSnapshot(
      performanceRef,
      (docSnap) => {
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
          console.log("Performance document not found!");
          setOccupiedSeats([]);
        }
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching seat snapshot:", error);
        setIsLoading(false);
        setOccupiedSeats([]);
        // 오류 처리 (예: 사용자에게 알림)
      }
    );

    // 컴포넌트 언마운트 또는 의존성 변경 시 구독 해제
    return () => unsubscribe();
  }, [performanceId, selectedDay, selectedTime]); // performanceDates 제거 (실시간 업데이트는 Firestore에서)

  // 좌석 선택/해제 핸들러 (API 호출 방식으로 변경)
  const handleSeatToggle = async (seatId: string) => {
    if (isUpdating) return; // 이미 업데이트 중이면 중복 호출 방지
    if (!userId) {
      alert("로그인이 필요합니다."); // 사용자 ID가 없으면 처리 중단
      return;
    }
    if (!selectedDay || !selectedTime) {
      alert("날짜와 시간을 먼저 선택해주세요.");
      return;
    }

    const isCurrentlySelected = selectedSeats.has(seatId);
    const seatInfo = occupiedSeats.find((seat) => seat.seatId === seatId);
    const isOccupiedByOther = seatInfo && seatInfo.occupantId !== userId;

    // 다른 사람이 점유한 좌석이면 선택/해제 불가 (클라이언트 측 1차 검증)
    if (isOccupiedByOther) {
      alert("이미 다른 사용자가 선택한 좌석입니다.");
      return;
    }

    const action = isCurrentlySelected ? "deselect" : "select";

    // 좌석 선택 시 최대 개수 확인 (클라이언트 측 1차 검증)
    if (action === "select" && selectedSeats.size >= maxSelectableSeats) {
      alert(`최대 ${maxSelectableSeats}개의 좌석만 선택할 수 있습니다.`);
      return;
    }

    setIsUpdating(true); // API 호출 시작 상태

    try {
      // API 호출
      const response = await axios.post("/api/reservation/update-seat", {
        performanceId,
        day: selectedDay,
        time: selectedTime,
        seatId,
        action,
      });

      if (response.data.success) {
        // API 호출 성공 시 로컬 상태 업데이트
        // Firestore 리스너가 자동으로 occupiedSeats를 업데이트하므로,
        // selectedSeats 상태만 관리하면 됩니다.
        const newSelected = new Set(selectedSeats);
        if (action === "select") {
          newSelected.add(seatId);
        } else {
          newSelected.delete(seatId);
        }
        setSelectedSeats(newSelected);
      } else {
        // API에서 실패 응답을 보낸 경우
        console.error("Failed to update seat:", response.data.message);
        alert(response.data.message || "좌석 업데이트에 실패했습니다.");
        // 실패 시 로컬 상태 롤백이 필요할 수 있으나, Firestore 리스너가
        // 최종 상태를 반영하므로 selectedSeats만 동기화하면 될 수 있습니다.
        // 필요하다면 occupiedSeats와 selectedSeats를 API 호출 전 상태로 되돌립니다.
      }
    } catch (error: any) {
      console.error("Error calling update-seat API:", error);
      // 네트워크 오류 또는 서버 내부 오류 등
      const message =
        error.response?.data?.message ||
        "좌석 업데이트 중 오류가 발생했습니다. 다시 시도해주세요.";
      alert(message);
    } finally {
      setIsUpdating(false); // API 호출 완료 상태
    }
  };

  // 다음 단계로 이동 (기존 로직 유지)
  const handleBooking = () => {
    if (selectedSeats.size === 0) {
      alert("좌석을 선택해주세요.");
      return;
    }
    // 선택된 좌석 정보와 함께 다음 단계로 이동
    setProcess("purchaserInfo");
  };

  // 시간대 선택 핸들러 (기존 로직 유지)
  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setSelectedSeats(new Set()); // 시간 변경 시 선택된 좌석 초기화
  };

  // 날짜 선택 핸들러 (시간 및 좌석 초기화 추가)
  const handleDaySelect = (date: string) => {
    setSelectedDay(date);
    setSelectedTime(""); // 날짜 변경 시 시간 초기화
    setSelectedSeats(new Set()); // 날짜 변경 시 선택된 좌석 초기화
    setOccupiedSeats([]); // 날짜 변경 시 점유 좌석 표시 초기화
    setIsLoading(true); // 로딩 표시 (시간 선택 전까지)
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
                  onClick={() => handleDaySelect(date)} // 수정된 핸들러 사용
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
                .sort((a, b) => a.time.localeCompare(b.time)) // 시간순 정렬
                .map((performance) => (
                  <li key={performance.time} className="mb-2">
                    <Button
                      size="small"
                      highlight={selectedTime === performance.time}
                      onClick={() => handleTimeSelect(performance.time)}
                      disabled={isUpdating} // 업데이트 중 비활성화
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
                occupiedSeats={occupiedSeats} // 실시간 업데이트된 점유 정보
                selectedSeats={selectedSeats} // 로컬에서 관리하는 선택 정보
                onSeatToggle={handleSeatToggle}
                userId={userId} // 좌석 소유자 표시 등에 사용될 수 있음
                disabled={isUpdating} // API 호출 중 좌석 선택 비활성화
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
            disabled={selectedSeats.size === 0 || isUpdating} // 좌석 미선택 또는 업데이트 중 비활성화
          >
            다음
          </Button>
        </li>
      </ul>
    </>
  );
}
