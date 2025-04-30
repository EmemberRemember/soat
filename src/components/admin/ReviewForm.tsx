"use client";
import { useState } from "react";
import { Review } from "@/types/admin";
import { CloseButton, Button } from "../controls/Button";
import { Radio } from "../controls/Inputs";
import Modal from "../Modal";
import { showToast } from "@/utils/toast";

export default function ReviewForm({
  review,
  reviewRadioOptions,
  reviewRadioState,
  onReviewRadioChange,
  onClose,
  onApply,
}: {
  review: Review;
  reviewRadioOptions: { value: string; label: string }[];
  reviewRadioState: string;
  onReviewRadioChange: (value: string) => void;
  onClose: () => void;
  onApply: () => void;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false); // 변경여부 모달 상태 관리
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false); // 변경사항 저장 확인 모달 상태 관리
  const [isHideReview, setIsHideReview] = useState(false); // 숨김 상태 관리

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={onClose}
        >
          <div
            className="w-[330px] h-[65%] max-h-[560px] p-4 bg-white rounded-md"
            onClick={(e) => e.stopPropagation()} // 모달 내부 클릭 시 모달 닫히지 않도록 방지
          >
            <div className="relative flex justify-center w-full">
              <h2 className="font-semibold text-center">한줄평 정보</h2>
              <CloseButton
                onClick={() => {
                  setIsOpen(false);
                  onClose();
                }}
                className="absolute right-0 top-0"
              />
            </div>

            {/* 리뷰 정보 내용 */}
            <section className="mt-4 text-xs">
              <h3 className="sr-only">한줄평 정보</h3>
              <div className="flex flex-wrap gap-x-1 gap-y-1">
                {[
                  { label: "공연명", value: review.title },
                  { label: "팀명", value: "-" },
                  { label: "한줄평 작성자", value: review.reviewer },
                  { label: "작성일", value: review.reviewDate },
                  {
                    label: "신고여부",
                    value:
                      review.reportedStatus == "신고됨" ? (
                        <div className="flex items-center gap-x-2">
                          <span>신고됨</span>
                          <Button
                            className="h-[20px] text-xs flex items-center"
                            size="small"
                            onClick={() => showToast("상세보기 클릭")}
                          >
                            상세보기
                          </Button>
                        </div>
                      ) : (
                        "정상"
                      ),
                  },
                ].map(({ label, value }, index) => (
                  <div className="flex w-full items-center" key={index}>
                    <dt className="mr-2 w-[80px]">{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-4">
              <h3 className="font-semibold text-sm py-2 border-t border-t-gray-300">
                한줄평 내용
              </h3>
              <div className="w-full bg-gray-200 p-2 rounded-sm text-xs">
                한줄평 내용을 담을 거예요
              </div>
            </section>

            <section className="mt-5">
              <h3 className="font-semibold text-sm py-2 border-t border-t-gray-300">
                한줄평 상태
              </h3>
              <Radio
                className="text-xs mt-1"
                checked={reviewRadioState}
                onChange={(value) => {
                  onReviewRadioChange(value);
                  setIsHideReview(value === "숨김"); // 라디오 값에 따라 숨김 여부 설정
                }}
                items={reviewRadioOptions}
              />
              <p className="text-xs text-gray-500 font-light mt-2 mb-4">
                (현재 상태 : <span>{reviewRadioState}</span>)
              </p>
              <Button
                highlight
                size="small"
                onClick={() => {
                  setIsModalOpen(true); // 모달 열기
                }}
              >
                상태 변경 적용
              </Button>
            </section>
          </div>
        </div>
      )}

      {/* 한줄평 상태 변경 여부 모달 */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          className=" flex flex-col justify-center items-center z-[1000]"
        >
          <div>
            <p className="text-xs">
              {isHideReview
                ? "해당 한줄평을 숨김 처리하시겠습니까?"
                : "해당 한줄평을 표시하시겠습니까?"}
            </p>
            <div className="flex justify-center gap-2">
              <Button
                size="small"
                onClick={() => setIsModalOpen(false)}
                className="mt-2 w-[60px]"
              >
                아니오
              </Button>
              <Button
                highlight
                size="small"
                onClick={() => {
                  setIsApplyModalOpen(true);
                  setIsModalOpen(false);
                  onApply(); // 상태 변경
                }}
                className="mt-2 w-[60px]"
              >
                예
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* 변경 완료 모달 */}
      {isApplyModalOpen && (
        <Modal
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          className=" flex flex-col justify-center items-center"
        >
          <div className="flex flex-col items-center">
            <p className="text-xs">
              {isHideReview
                ? "성공적으로 숨김 처리되었습니다."
                : "성공적으로 표시되었습니다."}
            </p>
            <p className="text-[10px] text-gray-500">
              {isHideReview ? '"관리자에 의해 숨겨진 댓글"로 표기됩니다.' : ""}
            </p>
            <Button
              highlight
              size="small"
              onClick={() => setIsApplyModalOpen(false)}
              className="mt-2 w-[60px]"
            >
              닫기
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
