export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth/authOptions";
import { adminDb } from "../firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

// 리뷰 데이터 타입 정의 (likedBy 배열 추가)
export interface ReviewData {
  id: string;
  performanceId: string;
  userId: string;
  username: string;
  ratings: number;
  date: string;
  content: string;
  likeCount: number;
  likedBy: string[]; // 좋아요한 사용자 ID 배열
  createdAt: string | number | Date | FieldValue;
  updatedAt: string | number | Date | FieldValue;
}

// 사용자 정보 가져오는 내부 함수
async function getUserData(userId: string, userType: string) {
  const collectionName = userType === "seller" ? "sellerUsers" : "buyerUsers";
  const userDoc = await adminDb.collection(collectionName).doc(userId).get();

  if (!userDoc.exists) {
    return null;
  }

  return userDoc.data();
}

// GET 함수 - 리뷰 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const performanceId = searchParams.get("performanceId");

    if (!performanceId) {
      return NextResponse.json(
        { error: "공연 ID가 필요합니다." },
        { status: 400 }
      );
    }

    // 현재 세션 가져오기
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    // 리뷰 데이터 조회
    const reviewsSnapshot = await adminDb
      .collection("reviews")
      .where("performanceId", "==", performanceId)
      .get();

    // 리뷰 데이터 변환
    const reviews = reviewsSnapshot.docs.map((doc) => {
      const data = doc.data();
      const likedBy = data.likedBy || [];

      // 로그인한 사용자가 작성한 리뷰인지 확인
      const isUserReview = userId === data.userId;
      // 사용자가 좋아요 눌렀는지 확인 (배열에 포함되어 있는지)
      const isLiked = userId ? likedBy.includes(userId) : false;

      return {
        id: doc.id,
        performanceId: data.performanceId,
        userId: data.userId,
        username: data.username,
        ratings: data.ratings,
        date: data.date,
        content: data.content,
        likeCount: data.likeCount || 0,
        isUserReview,
        isLiked,
      };
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error("리뷰 목록 조회 오류:", error);
    return NextResponse.json(
      { error: "리뷰 목록을 가져오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// POST 함수 - 리뷰 등록
export async function POST(request: NextRequest) {
  try {
    // 현재 세션 확인 (로그인 상태 확인)
    const session = await getServerSession(authOptions);

    // 로그인되지 않은 경우
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "리뷰를 작성하려면 로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const userType = session.user.userType;

    // 판매자는 리뷰 작성 불가능 (선택적 - 정책에 따라 제거 가능)
    if (userType === "seller") {
      return NextResponse.json(
        { error: "판매자는 리뷰를 작성할 수 없습니다." },
        { status: 403 }
      );
    }

    // 요청 본문 파싱
    const body = await request.json();
    const { performanceId, ratings, content } = body;

    // 필수 필드 검증
    if (!performanceId || !ratings || !content) {
      return NextResponse.json(
        {
          error:
            "필수 정보가 누락되었습니다. (performanceId, ratings, content)",
        },
        { status: 400 }
      );
    }

    // 평점 범위 확인 (1-5)
    if (ratings < 1 || ratings > 5) {
      return NextResponse.json(
        { error: "평점은 1에서 5 사이의 값이어야 합니다." },
        { status: 400 }
      );
    }

    // 공연 정보 확인
    const performRef = adminDb.collection("performances").doc(performanceId);
    const performDoc = await performRef.get();

    if (!performDoc.exists) {
      return NextResponse.json(
        { error: "존재하지 않는 공연입니다." },
        { status: 404 }
      );
    }

    // 중복 리뷰 확인 - 같은 사용자가 같은 공연에 이미 리뷰를 작성했는지 확인
    const existingReviewQuery = await adminDb
      .collection("reviews")
      .where("performanceId", "==", performanceId)
      .where("userId", "==", userId)
      .get();

    // 이미 리뷰가 존재하는 경우
    if (!existingReviewQuery.empty) {
      return NextResponse.json(
        { error: "이미 이 공연에 대한 리뷰를 작성하셨습니다." },
        { status: 409 } // 409 Conflict
      );
    }

    // 사용자 정보 조회
    const userData = await getUserData(userId, userType);

    if (!userData) {
      return NextResponse.json(
        { error: "사용자 정보를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const username = userData?.username || "사용자";

    // 현재 시간 (KST 기준)
    const kstOffset = 9 * 60 * 60 * 1000;
    const now = new Date(Date.now() + kstOffset);
    const today = now.toISOString().split("T")[0]; // YYYY-MM-DD 형식

    // Firestore 타임스탬프
    const timestamp = FieldValue.serverTimestamp();

    // 리뷰 ID 생성
    const reviewId = `review-${Date.now()}-${userId.substring(0, 6)}`;

    // 리뷰 데이터 생성 (빈 likedBy 배열 포함)
    const reviewData: ReviewData = {
      id: reviewId,
      performanceId,
      userId,
      username,
      ratings,
      date: today,
      content,
      likeCount: 0,
      likedBy: [], // 빈 배열로 초기화
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    // Firestore에 저장
    await adminDb.collection("reviews").doc(reviewId).set(reviewData);

    // 공연 문서의 리뷰 통계 업데이트
    await adminDb.runTransaction(async (transaction) => {
      const performanceDoc = await transaction.get(performRef);

      if (performanceDoc.exists) {
        const performanceData = performanceDoc.data();
        const currentRatingSum = performanceData?.ratingSum || 0;
        const currentRatingCount = performanceData?.ratingCount || 0;

        const newRatingSum = currentRatingSum + ratings;
        const newRatingCount = currentRatingCount + 1;
        const newAverageRating = parseFloat(
          (newRatingSum / newRatingCount).toFixed(1)
        );

        transaction.update(performRef, {
          ratingSum: newRatingSum,
          ratingCount: newRatingCount,
          averageRating: newAverageRating,
          updatedAt: timestamp,
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: "리뷰가 성공적으로 등록되었습니다.",
      review: {
        ...reviewData,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
    });
  } catch (error) {
    console.error("리뷰 등록 오류:", error);
    return NextResponse.json(
      { error: "리뷰 등록 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// PUT 함수 - 리뷰 좋아요 기능
export async function PUT(request: NextRequest) {
  try {
    // 현재 세션 확인
    const session = await getServerSession(authOptions);

    // 로그인되지 않은 경우
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 요청 본문 파싱
    const body = await request.json();
    const { reviewId, action } = body; // action: 'like' 또는 'unlike'

    if (!reviewId || !action) {
      return NextResponse.json(
        { error: "필수 정보가 누락되었습니다. (reviewId, action)" },
        { status: 400 }
      );
    }

    // 리뷰 문서 참조
    const reviewRef = adminDb.collection("reviews").doc(reviewId);

    // 트랜잭션 사용하여 atomic 업데이트
    await adminDb.runTransaction(async (transaction) => {
      const reviewDoc = await transaction.get(reviewRef);

      if (!reviewDoc.exists) {
        throw new Error("존재하지 않는 리뷰입니다.");
      }

      const reviewData = reviewDoc.data();
      const likedBy = reviewData?.likedBy || [];
      const timestamp = FieldValue.serverTimestamp();

      // 이미 좋아요를 누른 사용자인지 확인
      const userIndex = likedBy.indexOf(userId);

      if (action === "like" && userIndex === -1) {
        // 좋아요 추가
        likedBy.push(userId);
        transaction.update(reviewRef, {
          likedBy: likedBy,
          likeCount: reviewData?.likeCount + 1,
          updatedAt: timestamp,
        });
      } else if (action === "unlike" && userIndex !== -1) {
        // 좋아요 제거
        likedBy.splice(userIndex, 1);
        transaction.update(reviewRef, {
          likedBy: likedBy,
          likeCount: Math.max(0, reviewData?.likeCount - 1),
          updatedAt: timestamp,
        });
      }
    });

    return NextResponse.json({
      success: true,
      action: action,
    });
  } catch (error) {
    console.error("리뷰 좋아요 처리 오류:", error);
    return NextResponse.json(
      { error: "좋아요 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // 현재 세션 확인
    const session = await getServerSession(authOptions);

    // 로그인되지 않은 경우
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get("reviewId");

    if (!reviewId) {
      return NextResponse.json(
        { error: "리뷰 ID가 필요합니다." },
        { status: 400 }
      );
    }

    // 리뷰 문서 확인
    const reviewRef = adminDb.collection("reviews").doc(reviewId);
    const reviewDoc = await reviewRef.get();

    if (!reviewDoc.exists) {
      return NextResponse.json(
        { error: "존재하지 않는 리뷰입니다." },
        { status: 404 }
      );
    }

    const reviewData = reviewDoc.data();

    // 작성자 확인 - 자신이 작성한 리뷰만 삭제 가능
    if (reviewData?.userId !== userId) {
      return NextResponse.json(
        { error: "자신이 작성한 리뷰만 삭제할 수 있습니다." },
        { status: 403 }
      );
    }

    const performanceId = reviewData.performanceId;
    const ratings = reviewData.ratings;

    // 공연 문서 참조
    const performRef = adminDb.collection("performances").doc(performanceId);

    // 트랜잭션으로 리뷰 삭제 및 공연 평점 업데이트
    await adminDb.runTransaction(async (transaction) => {
      // 공연 문서 가져오기
      const performDoc = await transaction.get(performRef);

      if (performDoc.exists) {
        const performData = performDoc.data();
        const currentRatingSum = performData?.ratingSum || 0;
        const currentRatingCount = performData?.ratingCount || 0;

        // 해당 리뷰 평점을 제외한 새로운 합계와 개수 계산
        const newRatingCount = currentRatingCount - 1;
        const newRatingSum = currentRatingSum - ratings;

        // 리뷰가 없는 경우를 처리
        if (newRatingCount <= 0) {
          transaction.update(performRef, {
            ratingSum: 0,
            ratingCount: 0,
            averageRating: 0,
            updatedAt: FieldValue.serverTimestamp(),
          });
        } else {
          // 새 평균 계산
          const newAverageRating = parseFloat(
            (newRatingSum / newRatingCount).toFixed(1)
          );

          transaction.update(performRef, {
            ratingSum: newRatingSum,
            ratingCount: newRatingCount,
            averageRating: newAverageRating,
            updatedAt: FieldValue.serverTimestamp(),
          });
        }
      }

      // 리뷰 문서 삭제
      transaction.delete(reviewRef);
    });

    return NextResponse.json({
      success: true,
      message: "리뷰가 성공적으로 삭제되었습니다.",
    });
  } catch (error) {
    console.error("리뷰 삭제 오류:", error);
    return NextResponse.json(
      { error: "리뷰 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// PATCH 함수 - 리뷰 수정 기능
export async function PATCH(request: NextRequest) {
  try {
    // 현재 세션 확인
    const session = await getServerSession(authOptions);

    // 로그인되지 않은 경우
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 요청 본문 파싱
    const body = await request.json();
    const { reviewId, content, ratings } = body;

    if (!reviewId || !content || !ratings) {
      return NextResponse.json(
        { error: "필수 정보가 누락되었습니다. (reviewId, content, ratings)" },
        { status: 400 }
      );
    }

    // 평점 범위 확인 (1-5)
    if (ratings < 1 || ratings > 5) {
      return NextResponse.json(
        { error: "평점은 1에서 5 사이의 값이어야 합니다." },
        { status: 400 }
      );
    }

    // 리뷰 문서 확인
    const reviewRef = adminDb.collection("reviews").doc(reviewId);
    const reviewDoc = await reviewRef.get();

    if (!reviewDoc.exists) {
      return NextResponse.json(
        { error: "존재하지 않는 리뷰입니다." },
        { status: 404 }
      );
    }

    const reviewData = reviewDoc.data();

    // 작성자 확인 - 자신이 작성한 리뷰만 수정 가능
    if (reviewData?.userId !== userId) {
      return NextResponse.json(
        { error: "자신이 작성한 리뷰만 수정할 수 있습니다." },
        { status: 403 }
      );
    }

    const performanceId = reviewData.performanceId;
    const oldRatings = reviewData.ratings;

    // 공연 문서 참조
    const performRef = adminDb.collection("performances").doc(performanceId);

    // 타임스탬프
    const timestamp = FieldValue.serverTimestamp();

    // 트랜잭션으로 리뷰 수정 및 공연 평점 업데이트
    await adminDb.runTransaction(async (transaction) => {
      // 공연 문서 가져오기
      const performDoc = await transaction.get(performRef);

      if (performDoc.exists) {
        const performData = performDoc.data();
        const currentRatingSum = performData?.ratingSum || 0;

        // 평점이 변경된 경우에만 공연 평점 업데이트
        if (oldRatings !== ratings) {
          // 이전 평점을 빼고 새 평점을 더함
          const newRatingSum = currentRatingSum - oldRatings + ratings;

          // 평균 재계산
          const ratingCount = performData?.ratingCount || 0;
          const newAverageRating = parseFloat(
            (newRatingSum / ratingCount).toFixed(1)
          );

          transaction.update(performRef, {
            ratingSum: newRatingSum,
            averageRating: newAverageRating,
            updatedAt: timestamp,
          });
        }
      }

      // 리뷰 문서 업데이트
      transaction.update(reviewRef, {
        content: content,
        ratings: ratings,
        updatedAt: timestamp,
      });
    });

    return NextResponse.json({
      success: true,
      message: "리뷰가 성공적으로 수정되었습니다.",
    });
  } catch (error) {
    console.error("리뷰 수정 오류:", error);
    return NextResponse.json(
      { error: "리뷰 수정 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
