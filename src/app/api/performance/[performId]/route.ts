export const dynamic = "force-dynamic";

import { NextResponse, NextRequest } from "next/server";
import { adminDb } from "@/app/api/firebaseAdmin";

export async function GET(
  request: NextRequest,
  { params }: { params: { performId: string } }
) {
  const { performId } = params;
  console.log(performId);
  const performRef = adminDb.collection("performances").doc(performId);
  const performDoc = await performRef.get();

  if (!performDoc.exists) {
    return NextResponse.json(
      { error: "존재하지 않는 공연입니다." },
      { status: 404 }
    );
  }

  const performData = performDoc.data();

  // 공연 정보에서 민감 정보 제외
  // 주의! 데이터에 민감 정보가 추가될 경우 여기에도 추가해야 함
  const filteredPerformData = {
    ...performData,
    account: undefined,
  };

  return NextResponse.json({ performance: filteredPerformData });
}
