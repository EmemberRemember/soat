export const dynamic = "force-dynamic";

import BookHeader from "@/components/booking/BookHeader";
import BookMain from "@/components/booking/BookMain";
import { adminDb } from "@/app/api/firebaseAdmin";
import { PerformanceData } from "@/app/api/performance/route";

export default async function ReservationPopup({
  params,
}: {
  params: { showId: string };
}) {
  const { showId } = params;

  let showName = "공연 정보 없음";
  let performanceDoc = {} as PerformanceData;

  try {
    const showDoc = await adminDb.collection("performances").doc(showId).get();

    if (!showDoc.exists) {
      throw new Error("해당 공연이 존재하지 않습니다.");
    }

    const showData = showDoc.data();

    if (!showData) {
      throw new Error("공연 정보를 불러올 수 없습니다.");
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
