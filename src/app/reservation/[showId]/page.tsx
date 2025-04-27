export const dynamic = "force-dynamic";

import BookHeader from "@/components/booking/BookHeader";
import BookMain from "@/components/booking/BookMain";
import { adminDb } from "@/app/api/firebaseAdmin";
import { PerformanceData } from "@/app/api/performance/route";
import { Button } from "@/components/controls/Button";
import { CloseButtonClient } from "@/components/controls/CloseButton";

export default async function ReservationPopup({
  params,
}: {
  params: { showId: string };
}) {
  const { showId } = params;

  let showName = "공연 정보 없음";
  let performanceDoc = {} as PerformanceData;

  function close() {
    if (window) {
      window.close();
    }
  }

  try {
    const showDoc = await adminDb.collection("performances").doc(showId).get();

    if (!showDoc.exists) {
      throw new Error("해당 공연이 존재하지 않습니다.");
    }

    const showData = showDoc.data();

    if (!showData) {
      throw new Error("공연 정보를 불러올 수 없습니다.");
    }

    const today = new Date().toLocaleString();

    const bookingStartDate = showData.bookingStartDate;
    const bookingEndDate = showData.bookingEndDate;

    if (today < bookingStartDate || today > bookingEndDate) {
      return (
        <div className="flex flex-col items-center justify-center h-screen">
          <h1 className="text-2xl font-bold">예약 불가</h1>
          <p className="mt-4 text-lg">
            현재 예약할 수 없는 공연입니다. 예약 기간을 확인해주세요.
          </p>
          <CloseButtonClient className="mt-4" />
        </div>
      );
    }

    showName = showData.title || "공연 정보 없음";
    performanceDoc = {
      ...showData,
      createdAt: showData.createdAt.toDate(),
      updatedAt: showData.updatedAt.toDate(),
    } as PerformanceData;
  } catch (error) {
    console.error("공연 정보 불러오기 실패:", error);
    return;
  }

  return (
    <>
      <BookHeader showName={showName} />
      <BookMain showId={showId} performanceData={performanceDoc} />
    </>
  );
}
