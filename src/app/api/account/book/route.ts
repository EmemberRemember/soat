export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth/authOptions";
import { adminDb } from "../../firebaseAdmin";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "인증되지 않은 요청입니다." },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 'bookings' 컬렉션에서 userId로 필터링
    const reservationsSnapshot = await adminDb
      .collection("bookings")
      .where("purchaserInfo.userId", "==", userId)
      .get();

    // 예매 내역이 없는 경우
    if (reservationsSnapshot.empty) {
      return NextResponse.json({ reservations: [] });
    }

    // 예매 데이터 배열로 변환
    const reservations = reservationsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as { performanceId?: string }),
    }));

    // 중복 제거한 performanceIds 추출
    const performanceIds: string[] = [];
    reservations.forEach((booking) => {
      if (
        booking.performanceId &&
        !performanceIds.includes(booking.performanceId)
      ) {
        performanceIds.push(booking.performanceId);
      }
    });

    // 공연 정보 일괄 조회
    const performancesData = [];
    for (const perfId of performanceIds) {
      const performanceDoc = await adminDb.doc(`performances/${perfId}`).get();
      if (performanceDoc.exists) {
        performancesData.push({
          id: performanceDoc.id,
          ...performanceDoc.data(),
        });
      }
    }

    // 공연 정보를 ID를 키로 하는 객체로 변환
    const performancesMap: { [key: string]: any } = {};
    performancesData.forEach((perf) => {
      performancesMap[perf.id] = perf;
    });

    // 예매 정보에 공연 정보 병합
    const enrichedReservations = reservations.map((booking) => {
      const performance = booking.performanceId
        ? performancesMap[booking.performanceId]
        : null;
      return {
        ...booking,
        performanceDetails: performance
          ? {
              title: performance.title,
              address: performance.address,
              detailAddress: performance.detailAddress,
              poster: performance.poster.url,
              category: performance.category,
              sellerTeam: performance.sellerTeam,
            }
          : null,
      };
    });

    return NextResponse.json({ reservations: enrichedReservations });
  } catch (error) {
    console.error("예매 내역 조회 오류:", error);
    return NextResponse.json(
      { error: "예매 내역을 가져오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
