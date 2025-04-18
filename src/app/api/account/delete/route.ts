export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/app/api/firebaseAdmin";
import { compare } from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth/authOptions";

export async function POST(request: NextRequest) {
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

    const formData = await request.json();
    const { currentPassword } = formData;

    // 필수 입력값 검증
    if (!currentPassword || !userType) {
      return NextResponse.json(
        { error: "필수 입력값이 누락되었습니다." },
        { status: 400 }
      );
    }

    // 회원 유형에 따른 컬렉션 결정
    const collectionName = userType === "seller" ? "sellerUsers" : "buyerUsers";

    // 사용자 조회
    const userDoc = await adminDb.collection(collectionName).doc(userId).get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 사용자 문서 가져오기
    const userData = userDoc.data();

    if (!userData) {
      return NextResponse.json(
        { error: "사용자 정보를 가져올 수 없습니다." },
        { status: 404 }
      );
    }

    // 현재 비밀번호 확인
    const isPasswordValid = await compare(currentPassword, userData.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "현재 비밀번호가 일치하지 않습니다." },
        { status: 401 }
      );
    }

    const docRef = adminDb.collection(collectionName).doc(userDoc.id);

    const docSnapshot = await docRef.get();
    if (docSnapshot.exists) {
      const existingData = docSnapshot.data();

      // 기존 필드createdAt 를 유지하고 나머지 필드 제거
      const newData = {
        createdAt: existingData?.createdAt,
        isDeleteUser: true,
        updatedAt: new Date().toISOString(),
      };

      // 회원 탈퇴 적용
      await docRef.set(newData);
    } else {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "회원탈퇴가 성공적으로 처리되었습니다." },
      { status: 200 }
    );
  } catch (error) {
    console.error("회원탈퇴 오류:", error);
    return NextResponse.json(
      { error: "회원탈퇴 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
