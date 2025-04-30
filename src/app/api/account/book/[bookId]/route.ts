import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth/authOptions";
import { adminDb } from "../../../firebaseAdmin";
import { bookWithPerformance } from "@/types/reservation";
import { PerformanceDataWithStatus } from "@/components/manager/Performance";

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
    const bookingRef = adminDb.collection("bookings").doc(bookId);
    const bookingDoc = await bookingRef.get();

    if (!bookingDoc.exists) {
      return NextResponse.json(
        { error: "해당 예매 내역을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const bookingData = bookingDoc.data() as bookWithPerformance;

    if (bookingData.purchaserInfo.userId !== userId) {
      return NextResponse.json(
        { error: "접근 권한이 없습니다." },
        { status: 403 }
      );
    }

    const performanceDate = bookingData.performanceDate;
    const performanceTime = bookingData.performanceTime;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const performanceDateTime = new Date(
      `${performanceDate}T${performanceTime}`
    );

    if (performanceDateTime < today) {
      return NextResponse.json(
        { error: "예매 취소가 불가합니다." },
        { status: 403 }
      );
    }

    const performanceId = bookingData.performanceId;
    const refundsRef = adminDb.collection("refunds").doc(performanceId);

    await adminDb.runTransaction(async (transaction) => {
      const performanceRef = adminDb
        .collection("performances")
        .doc(performanceId);
      const performanceDoc = await transaction.get(performanceRef);
      const refundDoc = await transaction.get(refundsRef);

      if (!performanceDoc.exists) {
        throw new Error("공연 정보를 찾을 수 없습니다.");
      }

      const performanceData = performanceDoc.data();
      const performancesData = performanceData?.performances || {};

      if (performancesData[performanceDate]) {
        for (let i = 0; i < performancesData[performanceDate].length; i++) {
          const timeSlot = performancesData[performanceDate][i];
          if (Array.isArray(timeSlot.occupiedSeats)) {
            timeSlot.occupiedSeats = timeSlot.occupiedSeats.filter(
              (seat: any) => seat.reservationId !== bookId
            );
          }
        }
        transaction.update(performanceRef, {
          [`performances.${performanceDate}`]:
            performancesData[performanceDate],
        });
      }

      const newStatus =
        bookingData.paymentStatus === "booked" ||
        bookingData.paymentStatus === "pendingRefund"
          ? "pendingRefund"
          : "cancel";

      transaction.update(bookingRef, {
        paymentStatus: newStatus,
      });

      if (newStatus === "pendingRefund") {
        const now = new Date();
        const refundEntry = {
          phone: bookingData.purchaserInfo.phone,
          username: bookingData.purchaserInfo.name,
          price: bookingData.totalPrice,
          reservationId: bookingData.reservationId || bookId,
          userId: bookingData.purchaserInfo.userId,
          email: bookingData.purchaserInfo.email,
          performanceId: bookingData.performanceId,
          performanceDate: performanceDate,
          performanceTime: performanceTime,
          status: "pending",
          requestDate: now.toISOString().split("T")[0],
          seatCount: Array.isArray(bookingData.selectedSeats)
            ? bookingData.selectedSeats.length
            : 0,
          seats: bookingData.selectedSeats || [],
        };

        const existingPerformanceData = refundDoc.exists
          ? refundDoc.data()?.performance || {}
          : {};

        const existingTimeData =
          existingPerformanceData[performanceDate]?.[performanceTime] || [];

        const updatedPerformanceData = {
          ...existingPerformanceData,
          [performanceDate]: {
            ...existingPerformanceData[performanceDate],
            [performanceTime]: [...existingTimeData, refundEntry],
          },
        };

        transaction.set(
          refundsRef,
          { performance: updatedPerformanceData },
          { merge: true }
        );
      }
    });

    return NextResponse.json({
      success: true,
      message: "예매 취소 및 환불 요청이 접수되었습니다.",
    });
  } catch (error) {
    console.error("예매 취소 오류:", error);
    return NextResponse.json(
      { error: "예매를 취소하는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
