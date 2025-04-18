export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/app/api/firebaseAdmin";

const SECRET_KEY = process.env.NEXT_CRYPTO_SECRET_KEY;

if (!SECRET_KEY) {
  throw new Error("NEXT_CRYPTO_SECRET_KEY 환경 변수가 설정되지 않았습니다.");
}

async function approveId({ accountId }: { accountId: string }) {
  try {
    const userDoc = await adminDb
      .collection("sellerUsers")
      .doc(accountId)
      .get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: "해당하는 계정이 존재하지 않습니다." },
        { status: 404 }
      );
    }

    const userData = userDoc.data();

    if (!userData) {
      return NextResponse.json(
        { error: "해당하는 계정이 존재하지 않습니다." },
        { status: 404 }
      );
    }

    if (userData.isApproval) {
      return NextResponse.json(
        { error: "이미 승인된 계정입니다." },
        { status: 400 }
      );
    }

    await adminDb.collection("sellerUsers").doc(accountId).update({
      isApproval: true,
    });

    return NextResponse.json({ accountId, isApproval: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "계정 승인에 실패했습니다." },
      { status: 500 }
    );
  }
}

// Admin 권한 개발 후 주석 해제

export async function PUT(
  request: NextRequest,
  { params }: { params: { accountId: string } }
) {
  const { accountId } = params;

  const result = await approveId({ accountId });

  return result;
}
