import { NextResponse } from "next/server";
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
export async function GET(request: NextResponse, { params }: PageParams) {
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
      bookingId: bookingDoc.id,
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

    return NextResponse.json({ booking: enrichedBooking });
  } catch (error) {
    console.error("예매 내역 조회 오류:", error);
    return NextResponse.json(
      { error: "예매 내역을 가져오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
