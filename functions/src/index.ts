import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

// Firebase 초기화
admin.initializeApp();

// 매 5분마다 실행되는 함수로 만료된 좌석 정리
// V1 버전 사용
export const cleanExpiredSeats = functions.pubsub
  .schedule("every 5 minutes")
  .onRun(async (context): Promise<null> => {
    const db = admin.firestore();
    const perfRef = db.collection("performances");
    const perfDocs = await perfRef.get();

    logger.info("만료된 좌석 정리 시작", {
      structuredData: true,
    });
    let totalUpdatedCount = 0;

    // 현재 시간 - 15분 (밀리초)
    const expirationTime = Date.now() - 15 * 60 * 1000;

    // 모든 공연 문서를 확인
    for (const doc of perfDocs.docs) {
      const batch = db.batch();
      const data = doc.data();
      let isUpdated = false;
      const performances = data.performances || {};
      const updatedPerformances = {
        ...performances,
      };

      // performances 객체 내 각 날짜를 확인
      for (const day in updatedPerformances) {
        // 프로토타입 체인 속성 필터링
        if (Object.prototype.hasOwnProperty.call(updatedPerformances, day)) {
          const dayPerformances = [...updatedPerformances[day]];

          // 각 일별 시간대 공연 확인
          for (let i = 0; i < dayPerformances.length; i++) {
            const timePerf = dayPerformances[i];
            const seats = timePerf.occupiedSeats || [];

            // processing 상태이고 15분 이상 지난 좌석 필터링하여 제거
            const updatedSeats = seats.filter(
              (seat: any) =>
                !(
                  seat.status === "processing" &&
                  seat.occupiedAt < expirationTime
                )
            );

            // 좌석이 제거되었으면 업데이트
            if (updatedSeats.length !== seats.length) {
              dayPerformances[i] = {
                ...timePerf,
                occupiedSeats: updatedSeats,
              };
              isUpdated = true;

              // 삭제된 좌석 수
              const removedCount = seats.length - updatedSeats.length;
              totalUpdatedCount += removedCount;

              logger.info(
                `${day} ${timePerf.time}에서 ${removedCount}개 좌석 만료 삭제`,
                {
                  performanceId: doc.id,
                }
              );
            }
          }

          // 해당 날짜의 공연 데이터 업데이트
          updatedPerformances[day] = dayPerformances;
        }
      }

      // 변경사항이 있으면 Firestore 업데이트
      if (isUpdated) {
        batch.update(doc.ref, {
          performances: updatedPerformances,
        });
        await batch.commit();
      }
    }

    logger.info(`만료된 좌석 정리 완료: 총 ${totalUpdatedCount}개 정리됨`, {
      structuredData: true,
    });
    return null;
  });
