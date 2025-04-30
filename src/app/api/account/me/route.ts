export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth/authOptions";
import { adminDb } from "../../firebaseAdmin";

export async function GET(req: NextRequest) {
  try {
    // 현재 세션 확인
    const session = await getServerSession(authOptions);

    // 로그인되지 않은 경우
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "인증되지 않은 요청입니다." },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const userType = session.user.userType;

    // 사용자 타입에 따른 컬렉션 결정
    const collectionName = userType === "seller" ? "sellerUsers" : "buyerUsers";

    // Firestore에서 사용자 정보 조회
    const userDoc = await adminDb.collection(collectionName).doc(userId).get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: "사용자 정보를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const userData = userDoc.data();

    // 비밀번호는 제외하고 반환
    const { password: _password, ...userDataWithoutPassword } = userData!;

    return NextResponse.json({
      user: {
        userType: userType,
        id: userDoc.id,
        ...userDataWithoutPassword,
      },
    });
  } catch (error) {
    console.error("사용자 정보 조회 오류:", error);
    return NextResponse.json(
      { error: "사용자 정보를 가져오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
