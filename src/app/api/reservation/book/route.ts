// src/app/api/reservation/book/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/app/api/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth/authOptions";
import type { PerformanceData } from "@/app/api/performance/route";
import NextCrypto from "next-crypto"; // 기존 타입 재사용

// Firestore에 저장될 좌석 정보 타입 (update-seat와 유사하게 정의)
interface OccupiedSeatData {
  seatId: string;
  occupantId: string;
  occupiedAt: number; // JavaScript 타임스탬프 (숫자)
  status: "processing" | "pending" | "booked";
  reservationId: string;
}

// Firestore의 공연 시간 정보 타입
interface TimePerformanceData {
  time: string;
  casting: string[];
  occupiedSeats: OccupiedSeatData[];
}

// API 요청 본문 타입
interface BookingRequestBody {
  performanceId: string;
  selectedDay: string; // 예: "2024-08-15"
  selectedTime: string; // 예: "19:00"
  selectedSeats: string[]; // 예: ["A1", "A2"]
  purchaserInfo: {
    // PurchaserInfo 컴포넌트에서 수집된 정보 구조에 맞게 정의
    name: string;
    phone: string;
    email: string; // 선택적 필드 예시
  };
  totalPrice: number; // 총 결제 금액
}

export async function POST(request: NextRequest) {
  let session;
  let userId: string;

  const SECRET_KEY = process.env.NEXT_CRYPTO_SECRET_KEY;

  if (!SECRET_KEY) {
    throw new Error("NEXT_CRYPTO_SECRET_KEY 환경 변수가 설정되지 않았습니다.");
  }

  const crypto = new NextCrypto(SECRET_KEY);

  try {
    session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { message: "인증되지 않은 사용자입니다." },
        { status: 401 }
      );
    }
    userId = session.user.id;
  } catch (error) {
    console.error("Authentication error:", error);
    return NextResponse.json(
      { message: "인증 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }

  let requestBody: BookingRequestBody;
  try {
    requestBody = await request.json();
    const {
      performanceId,
      selectedDay,
      selectedTime,
      selectedSeats,
      purchaserInfo,
      totalPrice,
    } = requestBody;

    // 필수 데이터 검증
    if (
      !performanceId ||
      !selectedDay ||
      !selectedTime ||
      !selectedSeats ||
      selectedSeats.length === 0 ||
      !purchaserInfo ||
      !purchaserInfo.name ||
      !purchaserInfo.phone ||
      !purchaserInfo.email ||
      totalPrice === undefined ||
      totalPrice < 0
    ) {
      return NextResponse.json(
        {
          message: "필수 예매 정보가 누락되었거나 형식이 잘못되었습니다.",
          debug: {
            performanceId,
            selectedDay,
            selectedTime,
            selectedSeats,
            purchaserInfo,
            totalPrice,
          },
        },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { message: "잘못된 요청 형식입니다." },
      { status: 400 }
    );
  }

  const {
    performanceId,
    selectedDay,
    selectedTime,
    selectedSeats,
    purchaserInfo,
    totalPrice,
  } = requestBody;
  const performanceRef = adminDb.collection("performances").doc(performanceId);
  const bookingsRef = adminDb.collection("bookings"); // 새 bookings 컬렉션 참조

  try {
    // 트랜잭션 실행
    const bookingResult = await adminDb.runTransaction(async (transaction) => {
      // 1. 공연 정보 읽기 (트랜잭션 내에서)
      const performanceDoc = await transaction.get(performanceRef);
      if (!performanceDoc.exists) {
        throw new Error("공연 정보를 찾을 수 없습니다.");
      }
      const performanceData = performanceDoc.data() as PerformanceData;

      // 2. 해당 날짜/시간의 공연 및 좌석 정보 확인
      const performances = performanceData.performances || {};
      const originalDayPerformances: {
        occupiedSeats?: OccupiedSeatData[];
        time: string;
        casting: string[];
      }[] = (performances[selectedDay] || []).map((performance) => ({
        ...performance,
      }));
      // 수정할 배열 복사본 생성 (update-seat 로직 참고)
      const updatedDayPerformances = originalDayPerformances.map((p) => ({
        ...p,
        occupiedSeats: [...(p.occupiedSeats || [])], // occupiedSeats 배열도 복사
      }));

      const timeIndex = updatedDayPerformances.findIndex(
        (p) => p.time === selectedTime
      );
      if (timeIndex === -1) {
        throw new Error("선택한 날짜/시간의 공연 정보가 없습니다.");
      }

      const timePerformanceToUpdate = updatedDayPerformances[timeIndex];
      const occupiedSeats = timePerformanceToUpdate.occupiedSeats; // 복사된 배열

      // 3. 선택된 좌석 상태 검증 및 업데이트 준비
      const updatedOccupiedSeatsMap = new Map<string, OccupiedSeatData>(
        occupiedSeats.map((seat) => [seat.seatId, seat])
      );

      let reservationId;

      for (const seatId of selectedSeats) {
        const seat = updatedOccupiedSeatsMap.get(seatId);

        if (!seat) {
          throw new Error(`선택한 좌석(${seatId})이 점유 목록에 없습니다.`);
        }
        if (seat.occupantId !== userId) {
          throw new Error(
            `선택한 좌석(${seatId})은 다른 사용자가 점유 중입니다.`
          );
        }
        if (seat.status !== "processing") {
          throw new Error(
            `선택한 좌석(${seatId})의 상태가 올바르지 않습니다. (현재: ${seat.status})`
          );
        }
        // 상태를 'pending'으로 변경
        seat.status = "pending";

        reservationId = seat.reservationId;
      }

      // Map을 다시 배열로 변환하여 업데이트할 데이터 준비
      timePerformanceToUpdate.occupiedSeats = Array.from(
        updatedOccupiedSeatsMap.values()
      );

      // 4. bookings 컬렉션에 새 예매 문서 생성 (트랜잭션 내에서)
      const newBookingRef = bookingsRef.doc(`${reservationId}`);
      transaction.set(newBookingRef, {
        userId,
        performanceId,
        performanceDate: selectedDay,
        performanceTime: selectedTime,
        selectedSeats, // 예매된 좌석 ID 목록
        purchaserInfo: {
          ...purchaserInfo,
          userId, // 구매자 ID (서버 세션에서 가져옴)
        }, // 구매자 정보 객체
        bookingTimestamp: FieldValue.serverTimestamp(), // 서버 시간 기록
        totalPrice,
        paymentStatus: "pending", // 초기 결제 상태 (무통장 입금 등 대기)
        sellerId: performanceData.sellerId, // 판매자 ID
        createdAt: FieldValue.serverTimestamp(), // 예매 생성 시간
        updatedAt: FieldValue.serverTimestamp(), // 예매 수정 시간
        // 72시간 후 만료
        dueDate: new Date(Date.now() + 72 * 60 * 60 * 1000).getTime(),

        // reservationIds: selectedSeats.map(seatId => updatedOccupiedSeatsMap.get(seatId)?.reservationId).filter(id => !!id) // 각 좌석의 reservationId 저장 (선택적)
      });

      // 5. performances 문서의 좌석 상태 업데이트 (트랜잭션 내에서)
      transaction.update(performanceRef, {
        [`performances.${selectedDay}`]: updatedDayPerformances,
      });

      // 6. 예매 완료 후 판매자의 계좌 정보 로드
      const sellerDoc = await adminDb
        .collection("sellerUsers")
        .doc(performanceData.sellerId)
        .get();

      if (!sellerDoc.exists) {
        throw new Error("판매자 정보를 찾을 수 없습니다.");
      }

      const sellerData = sellerDoc.data();

      if (
        !sellerData ||
        !sellerData.bankAccount ||
        !sellerData.bankAccount.accountNum ||
        !sellerData.bankAccount.depositor ||
        !sellerData.bankAccount.bankName
      ) {
        throw new Error("판매자 계좌 정보가 올바르지 않습니다.");
      }

      // 계좌 정보 복호화
      const decryptedAccountNum = await crypto.decrypt(
        sellerData.bankAccount.accountNum
      );

      // 트랜잭션 성공 시 반환할 값 (예: 생성된 booking ID)
      return {
        bookTitle: performanceData.title,
        bookingId: newBookingRef.id,
        performanceId,
        performanceDate: selectedDay,
        performanceTime: selectedTime,
        performanceLocation: performanceData.address,
        selectedSeats,
        purchaserInfo,
        totalPrice,
        paymentStatus: "pending", // 초기 결제 상태
        sellerId: performanceData.sellerId,
        // 예시 결제 정보
        purchasingInfo: {
          method: "bankTransfer", // 예시: 무통장 입금
          bankName: sellerData.bankAccount.bankName,
          accountNumber: decryptedAccountNum,
          accountHolder: sellerData.bankAccount.depositor,
          amount: totalPrice,
        },
        dueDate: new Date(Date.now() + 72 * 60 * 60 * 1000).getTime(),
      };
    });

    // 트랜잭션 성공
    return NextResponse.json(
      {
        message: "예매가 성공적으로 접수되었습니다. (결제 대기)",
        bookingResult,
      },
      { status: 201 } // Created
    );
  } catch (error: any) {
    console.error("Booking transaction failed:", error);
    // 트랜잭션 실패 또는 기타 오류
    let status = 500;
    if (error.message.includes("찾을 수 없습니다")) status = 404;
    if (
      error.message.includes("점유 중") ||
      error.message.includes("상태가 올바르지 않습니다")
    )
      status = 409; // Conflict

    return NextResponse.json(
      { message: error.message || "예매 처리 중 오류가 발생했습니다." },
      { status }
    );
  }
}
