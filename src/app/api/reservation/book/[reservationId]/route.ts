import { adminDb } from "@/app/api/firebaseAdmin";
import { authOptions } from "@/auth/authOptions";
import { bookResultType } from "@/types/reservation";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

// 에러 타입 정의를 위한 인터페이스
interface CustomError extends Error {
  cause:
    | "AuthenticationError"
    | "BadRequest"
    | "NotFoundError"
    | "AuthorizationError";
}

// params를 통해 라우트 파라미터 접근
export async function GET(
  request: NextRequest,
  { params }: { params: { reservationId: string } }
) {
  let session;
  try {
    session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      const error = new Error("인증되지 않은 사용자입니다.") as CustomError;
      error.cause = "AuthenticationError";
      throw error;
    }

    const { reservationId } = params;

    if (!reservationId) {
      const error = new Error(
        "reservationId 파라미터가 필요합니다."
      ) as CustomError;
      error.cause = "BadRequest";
      throw error;
    }

    const bookingsCollection = adminDb
      .collection("bookings")
      .doc(reservationId);
    const bookingsSnapshot = await bookingsCollection.get();
    if (!bookingsSnapshot.exists) {
      const error = new Error("존재 하지 않는 예약 정보입니다.") as CustomError;
      error.cause = "NotFoundError";
      throw error;
    }

    const bookingDocData = bookingsSnapshot.data() as bookResultType;

    if (
      session.user.userType !== "seller" &&
      bookingDocData.sellerId !== session.user.id
    ) {
      const error = new Error("권한이 없습니다.") as CustomError;
      error.cause = "AuthorizationError";
      throw error;
    }

    return NextResponse.json(
      { message: "예약 정보를 불러왔습니다.", bookingData: bookingDocData },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("API Error:", error);
    let status = 500;
    let message = "서버 오류가 발생했습니다.";

    if (error instanceof Error) {
      const customError = error as Partial<CustomError>;
      switch (customError.cause) {
        case "AuthenticationError":
          status = 401;
          message = error.message;
          break;
        case "BadRequest":
          status = 400;
          message = error.message;
          break;
        case "NotFoundError":
          status = 404;
          message = error.message;
          break;
        case "AuthorizationError":
          status = 403;
          message = error.message;
          break;
        default:
          message = error.message || message;
          break;
      }
    }

    return NextResponse.json({ message: message }, { status: status });
  }
}
