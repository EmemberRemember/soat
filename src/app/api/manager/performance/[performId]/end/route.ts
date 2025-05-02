export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth/authOptions";
import { adminDb } from "@/app/api/firebaseAdmin";
import { firestore } from "firebase-admin";
import { OccupiedSeat } from "@/types/performance";

interface PageParams {
  params: {
    performId: string;
  };
}

interface CancelPerformanceBody {
  date: string; // 취소할 공연 날짜 (YYYY-MM-DD)
  time: string; // 취소할 공연 시간 (HH:MM)
}

export async function POST(request: NextRequest, { params }: PageParams) {
  try {
    const session = await getServerSession(authOptions);
    const { performId } = params;

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "인증되지 않은 요청입니다." },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = (await request.json()) as CancelPerformanceBody;
    const { date, time } = body;

    if (!date || !time) {
      return NextResponse.json(
        { error: "날짜와 시간은 필수 입력 항목입니다." },
        { status: 400 }
      );
    }

    // 1. 공연 정보 조회
    const performanceDoc = await adminDb
      .collection("performances")
      .doc(performId)
      .get();

    // 문서가 없는 경우
    if (!performanceDoc.exists) {
      return NextResponse.json(
        { error: "해당 공연을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const performanceData = performanceDoc.data();

    // 공연 소유자 확인 (보안)
    if (performanceData?.sellerId !== userId) {
      return NextResponse.json(
        { error: "이 공연을 취소할 권한이 없습니다." },
        { status: 403 }
      );
    }

    // 해당 날짜와 시간의 공연이 존재하는지 확인
    const performances = performanceData?.performances || {};
    if (!performances[date]) {
      return NextResponse.json(
        { error: "해당 날짜의 공연이 존재하지 않습니다." },
        { status: 404 }
      );
    }

    // 해당 시간의 공연 슬롯 찾기
    const timeSlotIndex = performances[date].findIndex(
      (slot: any) => slot.time === time
    );

    if (timeSlotIndex === -1) {
      return NextResponse.json(
        { error: "해당 시간의 공연이 존재하지 않습니다." },
        { status: 404 }
      );
    }

    // 해당 시간대의 예매 정보 수집
    const occupiedSeats = performances[date][timeSlotIndex].occupiedSeats || [];
    const reservationIds = occupiedSeats.map(
      (seat: OccupiedSeat) => seat.reservationId
    );
    const uniqueReservationIds = Array.from(new Set(reservationIds)); // 중복 제거

    // 현재 시간 생성 (updatedAt용)
    const now = firestore.Timestamp.now();

    // 2. 트랜잭션 시작 - 공연 상태 변경 및 예매 상태 업데이트
    await adminDb.runTransaction(async (transaction) => {
      const performanceRef = adminDb.collection("performances").doc(performId);
      const refundRef = adminDb.collection("refunds").doc(performId);
      const performanceSnapshot = await transaction.get(performanceRef);
      const refundDoc = await transaction.get(refundRef);

      const bookingDocs = [];
      for (const bookingId of uniqueReservationIds) {
        const bookingRef = adminDb
          .collection("bookings")
          .doc(bookingId as string);
        const bookingDoc = await transaction.get(bookingRef);
        if (bookingDoc.exists) {
          bookingDocs.push({ ref: bookingRef, doc: bookingDoc });
        } else {
          console.log(`Booking document not found for ${bookingId}`);
        }
      }

      // 특정 날짜의 전체 공연 배열 가져오기
      const datePerformances = performances[date];

      // 공연 슬롯 복사
      const originalSlot = performances[date][timeSlotIndex];
      let updatedSlot;
      // 예매된 좌석이 없는 경우 - 공연 상태만 'ended'로 바꿔주고 반환
      if (!Array.isArray(occupiedSeats) || occupiedSeats.length === 0) {
        updatedSlot = {
          ...originalSlot,
          status: "ended",
        };
      } else {
        // 좌석 상태 업데이트
        const updatedOccupiedSeats = originalSlot.occupiedSeats?.map(
          (seat: OccupiedSeat) => {
            let newStatus;

            if (seat.status === "booked" || seat.status === "pendingRefund") {
              newStatus = "pendingRefund";
            } else {
              newStatus = "cancel";
            }

            return {
              ...seat,
              status: newStatus,
            };
          }
        );

        // 공연 슬롯에 업데이트된 좌석 정보와 status 필드 반영
        updatedSlot = {
          ...originalSlot,
          status: "ended",
          occupiedSeats: updatedOccupiedSeats,
        };
      }
      // 기존 배열 복사 후 해당 인덱스만 업데이트
      const newDatePerformances = [...datePerformances];
      newDatePerformances[timeSlotIndex] = updatedSlot;

      // 날짜별 전체 배열을 업데이트
      transaction.update(performanceRef, {
        [`performances.${date}`]: newDatePerformances,
        updatedAt: now,
      });

      // 모든 관련 예매의 상태 업데이트
      for (const { ref: bookingRef, doc: bookingDoc } of bookingDocs) {
        const bookingData = bookingDoc.data();
        const bookingId = bookingDoc.id;

        if (bookingData) {
          const currentStatus = bookingData?.paymentStatus;

          // 예매 상태 업데이트 로직 개선
          let newStatus;
          if (currentStatus === "booked" || currentStatus === "pendingRefund") {
            newStatus = "pendingRefund";
          } else {
            newStatus = "cancel";
          }

          transaction.update(bookingRef, {
            paymentStatus: newStatus,
            updatedAt: now,
          });

          // refund 데이터 추가 (refunds 필드에 추가)
          const refundEntry = {
            phone: bookingData.purchaserInfo.phone,
            username: bookingData.purchaserInfo.name,
            price: bookingData.totalPrice,
            reservationId: bookingId,
            userId: bookingData.purchaserInfo.userId,
            email: bookingData.purchaserInfo.email,
            performanceId: performId,
            performanceDate: date,
            performanceTime: time,
            status: "pendingRefund",
            requestDate: now.toDate().toISOString().split("T")[0],
            seatCount: Array.isArray(bookingData.selectedSeats)
              ? bookingData.selectedSeats.length
              : 0,
            seats: bookingData.selectedSeats || [],
          };

          const existingData = refundDoc.exists
            ? refundDoc.data()?.performance || {}
            : {};

          const existingDateData = existingData[date] || {};
          const existingTimeRefunds = Array.isArray(existingDateData[time])
            ? existingDateData[time]
            : [];

          const updatedPerformance = {
            ...existingData,
            [date]: {
              ...existingDateData,
              [time]: [...existingTimeRefunds, refundEntry],
            },
          };

          // refundsRef를 사용하여 refund 정보 저장
          transaction.set(
            refundRef,
            { performance: updatedPerformance },
            { merge: true }
          );
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: "공연이 성공적으로 취소되었습니다.",
      cancelledCount: uniqueReservationIds.length,
    });
  } catch (error) {
    console.error("공연 취소 오류:", error);
    return NextResponse.json(
      { error: `공연을 취소하는 중 오류가 발생했습니다: ${error}` },
      { status: 500 }
    );
  }
}
