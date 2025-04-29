import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth/authOptions";
import { adminDb } from "../../../firebaseAdmin";
import { bookWithPerformance } from "@/types/reservation";
import { PerformanceDataWithStatus } from "@/components/manager/Performance";
import { OccupiedSeat } from "@/types/performance";

interface PageParams {
  params: {
    bookId: string;
  };
}
export async function GET(request: NextRequest, { params }: PageParams) {
  try {
    const session = await getServerSession(authOptions);
    const { bookId } = params;

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "인증되지 않은 요청입니다." },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 해당 ID의 예매 정보 조회
    const bookingDoc = await adminDb.collection("bookings").doc(bookId).get();

    // 문서가 없는 경우
    if (!bookingDoc.exists) {
      return NextResponse.json(
        { error: "해당 예매 내역을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const bookingData = {
      reservationId: bookingDoc.id,
      ...bookingDoc.data(),
    } as bookWithPerformance;

    // 예매 정보의 소유자 확인 (보안)
    if (bookingData.purchaserInfo.userId !== userId) {
      return NextResponse.json(
        { error: "접근 권한이 없습니다." },
        { status: 403 }
      );
    }

    // 공연 정보 조회
    let performanceDetails = null;
    if (bookingData.performanceId) {
      const performanceDoc = await adminDb
        .collection("performances")
        .doc(bookingData.performanceId)
        .get();

      if (performanceDoc.exists) {
        const performanceData =
          performanceDoc.data() as PerformanceDataWithStatus;

        performanceDetails = {
          id: performanceDoc.id,
          title: performanceData.title,
          address: performanceData.address,
          detailAddress: performanceData.detailAddress,
          poster: performanceData.poster.url,
          category: performanceData.category,
          sellerTeam: performanceData.sellerTeam,
        };
      }
    }

    // 예매 정보와 공연 정보 병합
    const enrichedBooking = {
      ...bookingData,
      performanceDetails,
    };

    return NextResponse.json(enrichedBooking);
  } catch (error) {
    console.error("예매 내역 조회 오류:", error);
    return NextResponse.json(
      { error: "예매 내역을 가져오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: PageParams) {
  try {
    const session = await getServerSession(authOptions);
    const { bookId } = params;

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "인증되지 않은 요청입니다." },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 1. 예매 정보 조회
    const bookingDoc = await adminDb.collection("bookings").doc(bookId).get();

    // 문서가 없는 경우
    if (!bookingDoc.exists) {
      return NextResponse.json(
        { error: "해당 예매 내역을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const bookingData = bookingDoc.data() as bookWithPerformance;

    // 예매 정보의 소유자 확인 (보안)
    if (bookingData.purchaserInfo.userId !== userId) {
      return NextResponse.json(
        { error: "접근 권한이 없습니다." },
        { status: 403 }
      );
    }

    // 공연 일자와 오늘 날짜와 동일하거나 많은 경우 예매 취소 불가
    const performanceDate = bookingData.performanceDate; // "2025-03-18" 형식
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const performanceDateTime = new Date(
      `${performanceDate}T${bookingData.performanceTime}`
    );

    if (performanceDateTime < today) {
      return NextResponse.json(
        { error: "예매 취소가 불가합니다." },
        { status: 403 }
      );
    }

    // 2. 필요한 데이터 추출
    const performanceId = bookingData.performanceId;

    // 3. 트랜잭션 시작 - 좌석 정보 업데이트 및 예매 상태 변경
    await adminDb.runTransaction(async (transaction) => {
      const performanceRef = adminDb
        .collection("performances")
        .doc(performanceId);
      const bookingRef = adminDb.collection("bookings").doc(bookId);

      const performanceDoc = await transaction.get(performanceRef);
      const bookingDocSnapshot = await transaction.get(bookingRef);

      if (!performanceDoc.exists || !bookingDocSnapshot.exists) {
        throw new Error("공연 또는 예매 정보를 찾을 수 없습니다.");
      }

      const performanceData = performanceDoc.data();
      const bookingData = bookingDocSnapshot.data() as bookWithPerformance;

      const performancesData = performanceData?.performances || {};

      if (performancesData[performanceDate]) {
        for (let i = 0; i < performancesData[performanceDate].length; i++) {
          const timeSlot = performancesData[performanceDate][i];

          if (timeSlot.occupiedSeats && Array.isArray(timeSlot.occupiedSeats)) {
            // reservationId를 기준으로 좌석 필터링
            const updatedOccupiedSeats = timeSlot.occupiedSeats.filter(
              (seat: OccupiedSeat) => seat.reservationId !== bookId
            );

            performancesData[performanceDate][i].occupiedSeats =
              updatedOccupiedSeats;
          }
        }

        transaction.update(performanceRef, {
          [`performances.${performanceDate}`]:
            performancesData[performanceDate],
        });
      }

      // 예매 상태 업데이트
      const newStatus =
        bookingData.paymentStatus === "booked" ||
        bookingData.paymentStatus === "pendingRefund"
          ? "pendingRefund"
          : "cancel";

      transaction.update(bookingRef, {
        paymentStatus: newStatus,
      });
    });

    return NextResponse.json({
      success: true,
      message: "예매가 성공적으로 취소되었습니다.",
    });
  } catch (error) {
    console.error("예매 취소 오류:", error);
    return NextResponse.json(
      { error: "예매를 취소하는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
