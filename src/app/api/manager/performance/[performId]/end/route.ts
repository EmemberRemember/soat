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
      // 먼저 모든 읽기 작업을 수행
      const performanceRef = adminDb.collection("performances").doc(performId);
      const performanceSnapshot = await transaction.get(performanceRef);

      // 모든 예매 정보를 미리 읽어옴
      const bookingDocs = [];
      for (const bookingId of uniqueReservationIds) {
        const bookingRef = adminDb
          .collection("bookings")
          .doc(bookingId as string);
        const bookingDoc = await transaction.get(bookingRef);
        bookingDocs.push({ ref: bookingRef, doc: bookingDoc });
      }

      // 특정 날짜의 전체 공연 배열 가져오기
      const datePerformances = performances[date];
      // 공연 슬롯 복사
      const originalSlot = datePerformances[timeSlotIndex];

      // 좌석 상태 업데이트 로직
      const updatedOccupiedSeats =
        originalSlot.occupiedSeats?.map((seat: OccupiedSeat) => {
          let newSeatStatus;
          if (seat.status === "booked" || seat.status === "pendingRefund") {
            newSeatStatus = "pendingRefund";
          } else {
            newSeatStatus = "cancel";
          }
          return {
            ...seat,
            status: newSeatStatus,
          };
        }) || [];

      // 공연 슬롯에 업데이트된 좌석 정보와 status 필드 반영
      const updatedSlot = {
        ...originalSlot,
        status: "ended",
        occupiedSeats: updatedOccupiedSeats,
      };

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
        if (bookingDoc.exists) {
          const bookingData = bookingDoc.data();
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
        }
      }
    });

    // 3. 취소된 예매에 대한 알림 생성 (선택적)
    const batch = adminDb.batch();

    for (const bookingId of uniqueReservationIds) {
      const bookingDoc = await adminDb
        .collection("bookings")
        .doc(bookingId as string)
        .get();

      if (bookingDoc.exists) {
        const bookingData = bookingDoc.data();
        const userId = bookingData?.purchaserInfo?.userId;

        if (userId) {
          const notificationRef = adminDb.collection("notifications").doc();
          batch.set(notificationRef, {
            userId: userId,
            type: "performanceCancelled",
            title: "공연 취소 알림",
            message: `예매하신 "${performanceData.title}" 공연(${date} ${time})이 취소되었습니다.`,
            performanceId: performId,
            bookingId: bookingId,
            createdAt: now,
            isRead: false,
          });
        }
      }
    }

    await batch.commit();

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

// 공연 종료 API 미사용으로 주석 처리 (등록된 공연의 날짜, 시간 일괄 종료)
// import { NextResponse } from "next/server";
// import { adminDb } from "@/app/api/firebaseAdmin";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/auth/authOptions";

// export async function PATCH(
//   req: Request,
//   { params }: { params: { performId: string } }
// ) {
//   try {
//     const session = await getServerSession(authOptions);

//     if (!session || !session.user) {
//       return NextResponse.json(
//         { error: "인증되지 않은 요청입니다." },
//         { status: 401 }
//       );
//     }

//     const userId = session.user.id;
//     const performanceId = params.performId;

//     const docRef = adminDb.collection("performances").doc(performanceId);
//     const doc = await docRef.get();

//     if (!doc.exists) {
//       return NextResponse.json(
//         { error: "해당 공연이 존재하지 않습니다." },
//         { status: 404 }
//       );
//     }

//     const data = doc.data();

//     if (data && data.sellerId !== userId) {
//       return NextResponse.json(
//         { error: "공연 종료 권한이 없습니다." },
//         { status: 403 }
//       );
//     }

//     const now = new Date();

//     await docRef.update({
//       updatedAt: now,
//       status: "ended",
//     });

//     return NextResponse.json(
//       { message: "공연이 성공적으로 종료되었습니다." },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("공연 종료 실패:", error);
//     return NextResponse.json(
//       { error: "공연 종료 중 오류가 발생했습니다." },
//       { status: 500 }
//     );
//   }
// }
