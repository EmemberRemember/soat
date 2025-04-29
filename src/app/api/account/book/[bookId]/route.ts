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
    console.log(performanceDateTime);

    if (performanceDateTime < today) {
      return NextResponse.json(
        { error: "예매 취소가 불가합니다." },
        { status: 403 }
      );
    }

    // 2. 필요한 데이터 추출
    const selectedSeats = bookingData.selectedSeats || [];
    const performanceId = bookingData.performanceId;

    // 3. 트랜잭션 시작 - 예매 기록 삭제 및 좌석 정보 업데이트
    await adminDb.runTransaction(async (transaction) => {
      // 공연 문서 참조
      const performanceRef = adminDb
        .collection("performances")
        .doc(performanceId);

      // 공연 정보 가져오기
      const performanceDoc = await transaction.get(performanceRef);

      if (!performanceDoc.exists) {
        throw new Error("공연 정보를 찾을 수 없습니다.");
      }

      const performanceData = performanceDoc.data();

      // performances 필드에서 해당 날짜의 데이터 가져오기
      const performancesData = performanceData?.performances || {};

      // 해당 날짜의 데이터가 있는지 확인
      if (performancesData[performanceDate]) {
        // 해당 날짜의 모든 회차 데이터 순회
        for (let i = 0; i < performancesData[performanceDate].length; i++) {
          const timeSlot = performancesData[performanceDate][i];

          // 해당 회차에 occupiedSeats 배열이 있는지 확인
          if (timeSlot.occupiedSeats && Array.isArray(timeSlot.occupiedSeats)) {
            // 취소할 좌석과 관련된 항목 필터링
            const updatedOccupiedSeats = timeSlot.occupiedSeats.filter(
              (seat: OccupiedSeat) => {
                // 현재 사용자의 ID와 일치하는지 확인하고
                // selectedSeats 배열에 있는 좌석인지 확인
                return !(
                  seat.occupantId === userId &&
                  selectedSeats.includes(seat.seatId)
                );
              }
            );

            // 필터링된 배열로 업데이트
            performancesData[performanceDate][i].occupiedSeats =
              updatedOccupiedSeats;
          }
        }

        // 공연 문서의 performances 필드 업데이트
        transaction.update(performanceRef, {
          [`performances.${performanceDate}`]:
            performancesData[performanceDate],
        });
      }

      // 예매 기록 삭제
      transaction.delete(adminDb.collection("bookings").doc(bookId));
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
