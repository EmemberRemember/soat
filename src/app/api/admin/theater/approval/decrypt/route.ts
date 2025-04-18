export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { adminStorage } from "@/app/api/firebaseAdmin";
import NextCrypto from "next-crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth/authOptions";

const SECRET_KEY = process.env.NEXT_CRYPTO_SECRET_KEY;

if (!SECRET_KEY) {
  throw new Error("NEXT_CRYPTO_SECRET_KEY 환경 변수가 설정되지 않았습니다.");
}

const crypto = new NextCrypto(SECRET_KEY);

// 암호화된 계좌 이미지를 복호화하여 base64로 반환
export async function POST(request: NextRequest) {
  const { accountImageUrl, originalImageType } = await request.json();

  try {
    const session = await getServerSession(authOptions);

    // 인증되지 않은 요청일 경우 에러 반환
    // 주의!!! admin 계정 개발이 완료되면 여기에 조건을 추가해야 합니다.
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "인증되지 않은 요청입니다." },
        { status: 401 }
      );
    }

    const accountImageRef = adminStorage.bucket().file(accountImageUrl);
    const [content] = await accountImageRef.download();

    const decryptedContent = await crypto.decrypt(content.toString());

    return NextResponse.json({
      base64Image: `data:image/${originalImageType};base64,${decryptedContent}`,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "계좌 이미지를 복호화하는데 실패했습니다." },
      { status: 500 }
    );
  }
}
