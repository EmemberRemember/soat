export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { adminDb } from "@/app/api/firebaseAdmin";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth/authOptions";

export async function DELETE(
  req: Request,
  { params }: { params: { performId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "인증되지 않은 요청입니다." },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const performanceId = params.performId;

    const docRef = adminDb.collection("performances").doc(performanceId);
    const doc = await docRef.get();
    console.log(docRef);

    if (!doc.exists) {
      return NextResponse.json(
        { error: "해당 공연이 존재하지 않습니다." },
        { status: 404 }
      );
    }

    const data = doc.data();
    if (data && data.sellerId !== userId) {
      return NextResponse.json(
        { error: "삭제 권한이 없습니다." },
        { status: 403 }
      );
    }

    await docRef.delete();

    return NextResponse.json(
      { message: "공연이 성공적으로 삭제되었습니다." },
      { status: 200 }
    );
  } catch (error) {
    console.error("공연 삭제 실패:", error);
    return NextResponse.json(
      { error: "공연 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
