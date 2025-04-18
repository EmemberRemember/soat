import React, { useState, useEffect } from "react";
import TextArea from "../controls/TextArea";
import { Star } from "lucide-react";
import ReviewList from "./ReviewList";
import { Button } from "../controls/Button";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";

export default function ReviewArea() {
  const [isReview, setReview] = useState("");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const { data: session, status } = useSession();
  const isLogined = status === "authenticated";
  // 사용자 타입 확인
  const userType = session?.user?.userType;
  const isSeller = userType === "seller";

  const params = useParams();
  const performId = params.performId;

  // 한줄평 중복 작성시 오류문구 초기화
  useEffect(() => {
    if (error !== "") {
      setError("");
    }
  }, [isReview]);

  // 리뷰 작성 함수
  const handleSubmitReview = async () => {
    // 입력 검증
    if (rating === 0) {
      alert("평점을 선택해주세요.");
      return;
    }

    if (!isReview.trim()) {
      alert("리뷰 내용을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          performanceId: performId,
          ratings: rating,
          content: isReview,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "리뷰 작성에 실패했습니다.");
      }

      // 성공 시 폼 초기화
      setReview("");
      setRating(0);
      window.location.reload();

      alert("리뷰가 성공적으로 등록되었습니다.");
    } catch (err) {
      const error = err as Error;
      console.error("리뷰 작성 중 오류:", err);
      setError(error.message || "리뷰 작성 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // textarea 플레이스홀더 메시지 설정
  const getPlaceholderText = () => {
    if (!isLogined) return "로그인 후 작성가능합니다!";
    if (isSeller) return "공연관리자는 한줄평을 작성할수없습니다.";
    return "한줄평은 최대 140 글자 까지 작성 가능합니다!";
  };

  // textarea 비활성화 여부 설정
  const isTextAreaDisabled = !isLogined || isSeller;

  return (
    <>
      <ul>
        <li className="flex gap-[10px] text-xl mb-[15px] items-center">
          <img src="/images/icons/Subtract-icon.svg" alt="" />
          <h2 className="font-bold">한줄평 작성하기</h2>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <label
                key={star}
                className={`cursor-pointer ${
                  isTextAreaDisabled ? "opacity-50" : ""
                }`}
                onMouseEnter={() => !isTextAreaDisabled && setHover(star)}
                onMouseLeave={() => !isTextAreaDisabled && setHover(0)}
              >
                <input
                  type="radio"
                  name="rating"
                  value={star}
                  className="hidden"
                  onChange={() => !isTextAreaDisabled && setRating(star)}
                  disabled={isTextAreaDisabled}
                />
                <Star
                  className="w-5 h-5"
                  color="#FC4C13"
                  fill={star <= (hover || rating) ? "#FC4C13" : "none"}
                  strokeWidth={1}
                />
              </label>
            ))}
          </div>
        </li>
        <li className="relative">
          <div className="flex flex-col gap-4">
            <TextArea
              value={isReview}
              onChange={setReview}
              placeholder={getPlaceholderText()}
              max={140}
              className={isTextAreaDisabled ? "bg-gray-100" : ""}
              disabled={isTextAreaDisabled}
            />
            <span className="absolute bottom-[65px] right-5 text-gray-500 text-sm">
              {isReview.length}/140
            </span>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex justify-end">
              <Button
                highlight
                className="text-white"
                onClick={handleSubmitReview}
                disabled={isTextAreaDisabled || isSubmitting}
              >
                {isSubmitting ? "작성 중..." : "작성하기"}
              </Button>
            </div>
          </div>
        </li>
      </ul>
      <ReviewList session={session?.user?.email || ""} />
    </>
  );
}
