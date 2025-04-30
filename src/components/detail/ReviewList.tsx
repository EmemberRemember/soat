"use client";
import React, { useState, useEffect } from "react";
import DetailPost from "./DetailPost";
import { useParams, useRouter } from "next/navigation";
import { Edit2, Trash2, X, Check } from "lucide-react"; // 아이콘 추가
import { Star } from "lucide-react";
import Modal from "../Modal";
import { Button, CloseButton } from "../controls/Button";
import { useShowModal } from "@/hooks/useShowModal";

// API로부터 가져올 리뷰 데이터 타입 정의
interface ReviewData {
  id: string;
  ratings: number;
  date: string;
  username: string;
  content: string;
  likeCount: number;
  isLiked?: boolean;
  isUserReview?: boolean; // 현재 사용자가 작성한 리뷰인지
}

// 수정 중인 리뷰 정보를 위한 인터페이스
interface EditingReview {
  id: string;
  content: string;
  ratings: number;
}

export default function ReviewList({ session }: { session: string }) {
  const params = useParams();
  const performId = params.performId;
  const router = useRouter();

  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [isReviewAlign, setReviewAlign] = useState("LASTEST");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteStatus, setDeleteStatus] = useState<{
    loading: boolean;
    error: string;
  }>({ loading: false, error: "" });
  const { showModal, handleShowModal } = useShowModal();

  // 수정 상태 관리
  const [editingReview, setEditingReview] = useState<EditingReview | null>(
    null
  );
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  // 리뷰 데이터 가져오기
  const fetchReviews = async () => {
    if (!performId) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/reviews?performanceId=${performId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "리뷰를 불러오는데 실패했습니다.");
      }

      const data = await response.json();
      setReviews(data.reviews || []);
    } catch (err) {
      console.error("리뷰 로딩 중 오류:", err);
      setError("리뷰를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [performId]);

  // 정렬 기능
  useEffect(() => {
    if (reviews.length === 0) return;

    const sortedReviews = [...reviews];

    if (isReviewAlign === "LASTEST") {
      sortedReviews.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    } else if (isReviewAlign === "RATING") {
      sortedReviews.sort((a, b) => b.ratings - a.ratings);
    } else if (isReviewAlign === "EMPATHY") {
      sortedReviews.sort((a, b) => b.likeCount - a.likeCount);
    }

    setReviews(sortedReviews);
  }, [isReviewAlign]);

  // 비회원 로그인 안내 모달 종료 핸들러
  const handleModalClose = () => {
    handleShowModal(false);
  };

  // 좋아요 처리 핸들러
  const handleLike = async (reviewId: string) => {
    if (!session) {
      handleShowModal(true);
      return;
    }

    try {
      // 현재 리뷰 찾기
      const reviewIndex = reviews.findIndex((r) => r.id === reviewId);
      if (reviewIndex === -1) return;

      const review = reviews[reviewIndex];
      const newIsLiked = !review.isLiked;

      // 낙관적 업데이트 (UI 먼저 변경)
      const updatedReviews = [...reviews];
      updatedReviews[reviewIndex] = {
        ...review,
        isLiked: newIsLiked,
        likeCount: newIsLiked
          ? review.likeCount + 1
          : Math.max(0, review.likeCount - 1),
      };

      setReviews(updatedReviews);

      // API 호출
      const response = await fetch("/api/reviews", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reviewId: reviewId,
          action: newIsLiked ? "like" : "unlike",
        }),
      });

      if (!response.ok) {
        setReviews(reviews); // 원래 상태로 복원
        console.error("좋아요 처리 실패");
        return;
      }
    } catch (error) {
      console.error("좋아요 처리 오류:", error);
      setReviews(reviews); // 오류 시 원래 상태로 복원
    }
  };

  // 리뷰 삭제 핸들러
  const handleDelete = async (reviewId: string) => {
    if (!confirm("리뷰를 삭제하시겠습니까?")) {
      return;
    }

    setDeleteStatus({ loading: true, error: "" });

    try {
      const response = await fetch(`/api/reviews?reviewId=${reviewId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "리뷰 삭제에 실패했습니다.");
      }

      // 삭제 성공 시 리뷰 목록 갱신
      fetchReviews();
      setDeleteStatus({ loading: false, error: "" });
    } catch (error) {
      console.error("리뷰 삭제 오류:", error);
      setDeleteStatus({
        loading: false,
        error: error instanceof Error ? error.message : "리뷰 삭제 오류",
      });
    }
  };

  // 수정 모드 전환 핸들러
  const handleEdit = (review: ReviewData) => {
    setEditingReview({
      id: review.id,
      content: review.content,
      ratings: review.ratings,
    });
  };

  // 수정 취소 핸들러
  const handleCancelEdit = () => {
    setEditingReview(null);
    setEditError("");
  };

  // 수정된 내용 변경 핸들러
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!editingReview) return;

    setEditingReview({
      ...editingReview,
      content: e.target.value,
    });
  };

  // 수정된 평점 변경 핸들러
  const handleRatingChange = (rating: number) => {
    if (!editingReview) return;

    setEditingReview({
      ...editingReview,
      ratings: rating,
    });
  };

  // 수정 저장 핸들러
  const handleSaveEdit = async () => {
    if (!editingReview) return;

    // 내용이 비어있는지 확인
    if (!editingReview.content.trim()) {
      setEditError("리뷰 내용을 입력해주세요.");
      return;
    }

    setEditLoading(true);
    setEditError("");

    try {
      const response = await fetch(`/api/reviews`, {
        method: "PATCH", // PATCH 메소드로 변경
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reviewId: editingReview.id,
          content: editingReview.content,
          ratings: editingReview.ratings,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "리뷰 수정에 실패했습니다.");
      }

      // 수정 성공 시 리뷰 목록 갱신
      fetchReviews();
      setEditingReview(null);
    } catch (error) {
      console.error("리뷰 수정 오류:", error);
      setEditError(error instanceof Error ? error.message : "리뷰 수정 오류");
    } finally {
      setEditLoading(false);
    }
  };

  // 로딩 중 표시
  if (loading) {
    return <div className="text-center py-10">리뷰를 불러오는 중...</div>;
  }

  // 에러 표시
  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  // 리뷰가 없는 경우
  if (reviews.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        아직 작성된 리뷰가 없습니다.
      </div>
    );
  }

  return (
    <div className="mt-[50px]">
      {deleteStatus.error && (
        <div className="bg-red-100 text-red-700 p-3 mb-4 rounded">
          {deleteStatus.error}
        </div>
      )}

      {editError && (
        <div className="bg-red-100 text-red-700 p-3 mb-4 rounded">
          {editError}
        </div>
      )}

      <ul className="flex gap-[20px] justify-self-end mb-8">
        <li
          className={`text-lg cursor-pointer ${
            isReviewAlign === "RATING"
              ? "text-black font-bold"
              : "text-gray-500"
          }`}
          onClick={() => {
            setReviewAlign("RATING");
          }}
        >
          평점순
        </li>
        <li
          className={`text-lg cursor-pointer ${
            isReviewAlign === "EMPATHY"
              ? "text-black font-bold"
              : "text-gray-500"
          }`}
          onClick={() => {
            setReviewAlign("EMPATHY");
          }}
        >
          공감순
        </li>
        <li
          className={`text-lg cursor-pointer ${
            isReviewAlign === "LASTEST"
              ? "text-black font-bold"
              : "text-gray-500"
          }`}
          onClick={() => {
            setReviewAlign("LASTEST");
          }}
        >
          최신글순
        </li>
      </ul>
      <section className="flex flex-col gap-y-3 mb-20">
        <h2 className="sr-only">한줄평 목록</h2>
        {reviews.map((data) => (
          <div key={data.id} className="relative">
            {editingReview && editingReview.id === data.id ? (
              <div className="w-full rounded-md border-2 flex flex-col pt-8 pb-12 px-11 relative">
                <div className="w-full flex flex-wrap justify-between items-center mb-8">
                  {/* 별점 수정 기능 - 여기에 StarRating 컴포넌트를 수정 가능하도록 구현 */}
                  <div>
                    <p className="mb-2 font-medium">평점 수정:</p>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleRatingChange(star)}
                          className="p-0 bg-transparent border-none cursor-pointer"
                          aria-label={`${star}점 선택`}
                        >
                          {star <= editingReview.ratings ? (
                            <Star className="w-5 h-5 fill-flesh-600 stroke-flesh-600" />
                          ) : (
                            <Star className="w-5 h-5 fill-white stroke-[#767676]" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                  <time dateTime={data.date}>{data.date}</time>
                </div>
                <div className="flex justify-between items-center">
                  <p className="font-bold text-lg">{data.username}</p>
                </div>
                <textarea
                  className="w-full mt-4 p-2 border rounded-md min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  value={editingReview.content}
                  onChange={handleContentChange}
                  placeholder="리뷰 내용을 입력하세요"
                />
                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                  <button
                    onClick={handleCancelEdit}
                    className="p-2 text-gray-500 hover:text-black flex items-center gap-1"
                    aria-label="수정 취소"
                    disabled={editLoading}
                  >
                    <X size={16} />
                    <span>취소</span>
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="p-2 text-blue-500 hover:text-blue-700 flex items-center gap-1"
                    aria-label="수정 저장"
                    disabled={editLoading}
                  >
                    <Check size={16} />
                    <span>{editLoading ? "저장 중..." : "저장"}</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <DetailPost
                  id={data.id}
                  ratings={data.ratings}
                  date={data.date}
                  author={data.username}
                  content={data.content}
                  likeCount={data.likeCount}
                  isLiked={data.isLiked || false}
                  onLike={handleLike}
                />
                {/* 수정/삭제 버튼 - 본인이 작성한 리뷰에만 표시 */}
                {data.isUserReview && (
                  <div className="absolute bottom-3 right-3 flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(data)}
                      className="p-2 text-gray-500 hover:text-blue-500 flex items-center gap-1"
                      aria-label="리뷰 수정"
                      disabled={deleteStatus.loading}
                    >
                      <Edit2 size={16} />
                      <span>수정</span>
                    </button>
                    <button
                      onClick={() => handleDelete(data.id)}
                      className="p-2 text-gray-500 hover:text-red-500 flex items-center gap-1"
                      aria-label="리뷰 삭제"
                      disabled={deleteStatus.loading}
                    >
                      <Trash2 size={16} />
                      <span>삭제</span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </section>
      <Modal
        isOpen={showModal}
        onClose={handleModalClose}
        className="flex flex-col justify-center items-center relative gap-4 py-10"
      >
        <>
          <CloseButton
            onClick={() => handleModalClose()}
            className="absolute top-4 right-4"
          />
          <p className="text-center">
            로그인 후 좋아요 기능을 이용할 수 있습니다.
            <br />
            로그인 하시겠습니까?
          </p>
          <ul className="flex text-sm gap-1">
            <li>
              <Button
                onClick={() => router.push("/login")}
                className="max-w-20 px-[28.5px] py-[7.5px]"
              >
                예
              </Button>
            </li>
            <li>
              <Button
                highlight
                onClick={() => handleModalClose()}
                className="max-w-20 px-[28.5px] py-[7.5px]"
              >
                아니오
              </Button>
            </li>
          </ul>
        </>
      </Modal>
    </div>
  );
}
