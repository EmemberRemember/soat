export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { adminDb } from "@/app/api/firebaseAdmin";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth/authOptions";

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

    // Firestore에서 현재 사용자가 등록한 공연 목록 조회
    const performancesSnapshot = await adminDb
      .collection("performances")
      .where("sellerId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    const performances = performancesSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate().toISOString(),
        updatedAt: data.updatedAt?.toDate().toISOString(),
      };
    });

    return NextResponse.json(performances, { status: 200 });
  } catch (error) {
    console.error("공연 목록 불러오기 실패:", error);
    return NextResponse.json(
      { error: "공연 목록을 불러오는 데 실패했습니다." },
      { status: 500 }
    );
  }
}
