export const dynamic = "force-dynamic";

import { adminDb } from "@/app/api/firebaseAdmin";
import { authOptions } from "@/auth/authOptions";
import { bookResultType } from "@/types/reservation";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

interface BookingResultTypeWithUseTicket extends bookResultType {
  useTicket: boolean;
}

interface CustomError extends Error {
  cause:
    | "AuthenticationError"
    | "BadRequest"
    | "NotFoundError"
    | "AuthorizationError";
}

export async function POST(
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

    const bookingDocData =
      bookingsSnapshot.data() as BookingResultTypeWithUseTicket;

    if (
      session.user.userType !== "seller" &&
      bookingDocData.sellerId !== session.user.id
    ) {
      const error = new Error("권한이 없습니다.") as CustomError;
      error.cause = "AuthorizationError";
      throw error;
    }

    if (bookingDocData.paymentStatus !== "booked") {
      const error = new Error("입금이 완료되지 않은 티켓입니다.");
      error.cause = "BadRequest";
      throw error;
    }

    if (bookingDocData.useTicket) {
      const error = new Error("이미 사용한 티켓입니다.");
      error.cause = "BadRequest";
      throw error;
    }

    await bookingsCollection.update({
      useTicket: true,
    });

    return NextResponse.json(
      { message: "티켓을 사용하였습니다.", data: { valid: true } },
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
