export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { adminDb } from "@/app/api/firebaseAdmin";
import NextCrypto from "next-crypto";
import { NewTheaterAdmin } from "@/types/admin";

const SECRET_KEY = process.env.NEXT_CRYPTO_SECRET_KEY;

if (!SECRET_KEY) {
  throw new Error("NEXT_CRYPTO_SECRET_KEY 환경 변수가 설정되지 않았습니다.");
}

const crypto = new NextCrypto(SECRET_KEY);

async function getTheaterWaitingList() {
  try {
    const waitingTheatersDoc = await adminDb
      .collection("sellerUsers")
      .where("isApproval", "==", false)
      .get();

    const waitingTheaters = waitingTheatersDoc.docs.map((doc) => doc.data());

    // 계좌 정보 암호화 해제
    const decryptedWaitingTheaters = await Promise.all(
      waitingTheaters.map(async (theater) => {
        const decryptedTheater = { ...theater };
        decryptedTheater.bankAccount.accountNum = await crypto.decrypt(
          decryptedTheater.bankAccount.accountNum
        );
        decryptedTheater.createdAt = new Date(
          decryptedTheater.createdAt
        ).toLocaleString("ko-KR");
        decryptedTheater.updatedAt = new Date(
          decryptedTheater.updatedAt
        ).toLocaleString("ko-KR");
        return decryptedTheater;
      })
    );
    return decryptedWaitingTheaters as NewTheaterAdmin[];
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function GET() {
  const waitingTheaters = await getTheaterWaitingList();

  if (!waitingTheaters) {
    return NextResponse.json(
      { error: "극장 목록을 불러오는 데 실패했습니다." },
      { status: 500 }
    );
  }

  return NextResponse.json(waitingTheaters);
}
