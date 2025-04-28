// src/app/api/reservation/update-seat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/app/api/firebaseAdmin";
// FieldValue는 더 이상 직접 사용하지 않으므로 제거해도 됩니다.
// import { FieldValue } from "firebase-admin/firestore";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth/authOptions";
import { nanoid } from "nanoid";

interface UpdateSeatRequestBody {
  performanceId: string;
  day: string;
  time: string;
  seatId: string;
  action: "select" | "deselect";
}

// Firestore에 저장될 좌석 정보 타입 (occupiedAt을 number로 명시)
interface OccupiedSeatData {
  seatId: string;
  occupantId: string;
  occupiedAt: number; // JavaScript 타임스탬프 (숫자)
  status: "processing" | "pending" | "booked"; // 필요한 상태 추가
  reservationId: string;
}

// Firestore의 공연 시간 정보 타입
interface TimePerformanceData {
  time: string;
  casting: string[]; // 예시 타입, 실제 타입에 맞게 조정 필요
  occupiedSeats: OccupiedSeatData[];
}

interface ApiResponse {
  success: boolean;
  message?: string;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse>> {
  let session;
  let userId: string;
  try {
    session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    userId = session.user.id;
  } catch (error) {
    console.error("Authentication error:", error);
    return NextResponse.json(
      { success: false, message: "Authentication failed" },
      { status: 500 }
    );
  }

  let requestBody: UpdateSeatRequestBody;
  try {
    requestBody = await request.json();
    const { performanceId, day, time, seatId, action } = requestBody;

    if (!performanceId || !day || !time || !seatId || !action) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Invalid request body" },
      { status: 400 }
    );
  }

  const { performanceId, day, time, seatId, action } = requestBody;
  const performanceRef = adminDb.collection("performances").doc(performanceId);

  try {
    await adminDb.runTransaction(async (transaction) => {
      const docSnap = await transaction.get(performanceRef);
      if (!docSnap.exists) {
        throw new Error("Performance not found");
      }

      const data = docSnap.data();
      if (!data) {
        throw new Error("Performance data is empty");
      }

      // 기존 데이터 깊은 복사 또는 필요한 부분만 복사하여 수정
      const performances = data.performances || {};
      // 해당 날짜의 공연 배열 가져오기 (없으면 빈 배열)
      const originalDayPerformances: TimePerformanceData[] =
        performances[day] || [];
      // 수정할 배열 복사본 생성
      const updatedDayPerformances = originalDayPerformances.map((p) => ({
        ...p,
        occupiedSeats: [...(p.occupiedSeats || [])],
      }));

      const timeIndex = updatedDayPerformances.findIndex(
        (p) => p.time === time
      );

      if (timeIndex === -1) {
        // 참고: 만약 해당 시간대가 없을 경우 새로 생성해야 한다면 여기서 처리
        // 예: updatedDayPerformances.push({ time, casting: [], occupiedSeats: [] }); timeIndex = updatedDayPerformances.length - 1;
        throw new Error(`Performance time slot not found for ${day} ${time}`);
      }

      // 수정할 시간대의 공연 정보 및 좌석 배열 가져오기
      const timePerformanceToUpdate = updatedDayPerformances[timeIndex];
      const occupiedSeats = timePerformanceToUpdate.occupiedSeats; // 이미 복사된 배열

      const seatIndex = occupiedSeats.findIndex((s) => s.seatId === seatId);
      const existingSeat = seatIndex !== -1 ? occupiedSeats[seatIndex] : null;

      if (action === "select") {
        if (existingSeat) {
          if (existingSeat.occupantId !== userId) {
            throw new Error("Seat already occupied by another user");
          } else {
            console.log("Seat already selected by the user.");
            return; // 변경 없음
          }
        }

        const userSelectedSeats = occupiedSeats.filter(
          (s) => s.occupantId === userId
        );
        const maxSelectableSeats = 4;
        if (userSelectedSeats.length >= maxSelectableSeats) {
          throw new Error(
            `Cannot select more than ${maxSelectableSeats} seats`
          );
        }

        const reservationId = nanoid(10);
        const newSeat: OccupiedSeatData = {
          seatId,
          occupantId: userId,
          occupiedAt: new Date().getTime(), // 숫자 타임스탬프 사용
          status: "processing",
          reservationId,
        };

        // 복사된 occupiedSeats 배열에 새 좌석 추가
        occupiedSeats.push(newSeat);
      } else if (action === "deselect") {
        if (!existingSeat) {
          console.log("Seat not found in occupied list.");
          return; // 변경 없음
        }

        if (existingSeat.occupantId !== userId) {
          throw new Error("Cannot deselect a seat occupied by another user");
        }

        // 복사된 occupiedSeats 배열에서 해당 좌석 제거
        occupiedSeats.splice(seatIndex, 1);
      } else {
        throw new Error("Invalid action specified");
      }

      // 트랜잭션 내에서 수정된 전체 dayPerformances 배열로 업데이트
      // 이렇게 하면 해당 날짜의 전체 공연 정보가 덮어씌워짐
      transaction.update(performanceRef, {
        [`performances.${day}`]: updatedDayPerformances,
      });
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating seat:", error);
    const message = error.message || "Failed to update seat";
    let status = 500;
    if (message.includes("not found")) status = 404;
    if (
      message.includes("occupied by another") ||
      message.includes("Cannot deselect")
    )
      status = 409;
    if (message.includes("Cannot select more than")) status = 400;

    return NextResponse.json({ success: false, message }, { status });
  }
}
