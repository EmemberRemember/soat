// /api/performance/route.ts
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/app/api/firebaseAdmin";
import { DailyPerformances } from "@/types/enrollment"; // 타입 import
import { TheaterLayoutData } from "@/components/seats/TheaterLayoutManager";
import { Timestamp } from "firebase-admin/firestore";

// API 응답에 사용할 타입 정의
export interface PerformanceData {
  id?: string;
  title: string;
  category: string;
  bookingStartDate: string;
  bookingEndDate: string;
  postCode: string;
  address: string;
  detailAddress: string;
  poster: {
    fileName: string;
    fileSize: number;
    fileType: string;
    url: string;
  };
  performances: DailyPerformances;
  content: string;
  price: number;
  sellerId: string;
  sellerTeam: string;
  createdAt: string | number | Date | Timestamp;
  updatedAt: string | number | Date | Timestamp;
  seats: TheaterLayoutData;
  // 기타 필요한 필드들
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const order = searchParams.get("order") || "createdAt";
  const status = searchParams.get("status");

  // 기본 쿼리 설정
  let query = adminDb.collection("performances").orderBy(order);

  // 현재 날짜 가져오기 (YYYY-MM-DD 형식)
  const kstOffset = 9 * 60 * 60 * 1000;
  const today = new Date(Date.now() + kstOffset).toISOString().split("T")[0];

  // status 파라미터에 따른 필터링
  if (status === "booking") {
    // 현재 예매 중인 공연 (오늘 날짜가 예매 시작일과 종료일 사이에 있는 경우)
    query = adminDb
      .collection("performances")
      .where("bookingStartDate", "<=", today)
      .where("bookingEndDate", ">=", today)
      .orderBy(order);
  } else if (status === "upcoming") {
    // 예매 예정 공연 (예매 시작일이 오늘 이후인 경우)
    query = adminDb
      .collection("performances")
      .where("bookingStartDate", ">", today)
      .orderBy("bookingStartDate");
  } else if (status === "past") {
    // 지난 공연 (예매 종료일이 오늘 이전인 경우)
    query = adminDb
      .collection("performances")
      .where("bookingEndDate", "<", today)
      .orderBy(order);
  }

  // 공연 날짜 필터링 (선택적)
  const performanceDate = searchParams.get("date");
  if (performanceDate) {
    // 특정 날짜에 공연이 있는 항목만 필터링
    const performancesSnapshot = await query.get();
    const performances = performancesSnapshot.docs
      .map((doc) => {
        const data = doc.data() as PerformanceData;
        return {
          id: doc.id,
          ...data,
          account: undefined,
          seats: undefined,
          _persist: undefined,
        };
      })
      .filter(
        (performance) =>
          performance.performances &&
          performance.performances[performanceDate] !== undefined
      );

    return NextResponse.json(performances);
  }

  // 기본 쿼리 실행
  const performancesSnapshot = await query.get();

  const performances = performancesSnapshot.docs.map((doc) => {
    const data = doc.data() as PerformanceData;
    return {
      id: doc.id,
      ...data,
      account: undefined,
      seats: undefined,
      _persist: undefined,
    };
  });

  return NextResponse.json(performances);
}
