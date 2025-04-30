export const dynamic = "force-dynamic";
import { adminDb } from "@/app/api/firebaseAdmin";
import { PerformanceData } from "@/app/api/performance/route";
import { authOptions } from "@/auth/authOptions";
import { PerformanceTime } from "@/types/performance";
import { bookResultType } from "@/types/reservation";
import { getServerSession, Session } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

type BookedStatus = "pending" | "booked";
// 에러 타입 정의를 위한 인터페이스

interface PerformanceDataWithOcuupiedSeat extends PerformanceData {
  performances: Record<string, PerformanceTime[]>;
}

interface ReservationBody {
  status: BookedStatus;
  performanceId: string;
  performanceDate: string;
  performanceTime: string;
}
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { reservationId: string } }
) {
  let session: Session | null;
  try {
    session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      const error = new Error("인증되지 않은 사용자입니다.") as CustomError;
      error.cause = "AuthenticationError";
      throw error;
    }

    const { reservationId } = params;
    const requestBody = (await request.json()) as ReservationBody;
    const { performanceId, status, performanceDate, performanceTime } =
      requestBody;

    const updateBookData = {} as bookResultType;
    if (
      !reservationId ||
      !performanceId ||
      !status ||
      !performanceDate ||
      !performanceTime
    ) {
      const error = new Error("필수 파라미터가 누락되었습니다.") as CustomError;
      error.cause = "BadRequest";
      throw error;
    }

    if (status !== "booked" && status !== "pending") {
      const error = new Error(
        "status 값은 'booked' 또는 'pending' 이어야 합니다."
      ) as CustomError;
      error.cause = "BadRequest";
      throw error;
    }

    const bookingsCollection = adminDb
      .collection("bookings")
      .doc(reservationId);
    const performanceCollection = adminDb
      .collection("performances")
      .doc(performanceId);

    await adminDb.runTransaction(async (transaction) => {
      const performanceSnapshot = await transaction.get(performanceCollection);
      const bookingsSnapshot = await transaction.get(bookingsCollection);

      if (!bookingsSnapshot.exists || !performanceSnapshot.exists) {
        const error = new Error(
          "존재하지 않는 예약 정보입니다."
        ) as CustomError;
        error.cause = "NotFoundError";
        throw error;
      }

      const performanceData =
        performanceSnapshot.data() as PerformanceDataWithOcuupiedSeat;
      const bookingDocData = bookingsSnapshot.data() as bookResultType;

      if (
        !session ||
        session.user.userType !== "seller" ||
        bookingDocData.sellerId !== session.user.id
      ) {
        const error = new Error("권한이 없습니다.") as CustomError;
        error.cause = "AuthorizationError";
        throw error;
      }

      const targetPerformance = performanceData.performances[performanceDate];

      if (!targetPerformance || !Array.isArray(targetPerformance)) {
        const error = new Error(
          "해당 날짜의 공연 정보를 찾을 수 없습니다."
        ) as CustomError;
        error.cause = "NotFoundError";
        throw error;
      }

      const targetPerformanceTime = targetPerformance.find(
        (pt) => pt.time === performanceTime
      );
      if (!targetPerformanceTime) {
        const error = new Error(
          "해당 시간의 공연 정보를 찾을 수 없습니다."
        ) as CustomError;
        error.cause = "NotFoundError";
        throw error;
      }

      const updatedOccupiedSeats = targetPerformanceTime.occupiedSeats?.map(
        (seat) =>
          seat.reservationId === reservationId ? { ...seat, status } : seat
      );

      Object.assign(updateBookData, bookingDocData);
      updateBookData.paymentStatus = status;

      transaction.update(bookingsCollection, { paymentStatus: status });
      transaction.update(performanceCollection, {
        [`performances.${performanceDate}`]: performanceData.performances[
          performanceDate
        ].map((pt) =>
          pt.time === performanceTime
            ? { ...pt, occupiedSeats: updatedOccupiedSeats }
            : pt
        ),
      });
    });

    return NextResponse.json(
      {
        message: "입금 상태를 변경하였습니다.",
        bookedData: { updateBookData },
      },
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
    return NextResponse.json({ message }, { status });
  }
}
