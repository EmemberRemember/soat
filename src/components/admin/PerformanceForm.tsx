"use client";
import { useState } from "react";
import { Performance } from "@/types/admin";
import { CloseButton, Button } from "../controls/Button";
import { Radio } from "../controls/Inputs";
import Modal from "../Modal";
import { showToast } from "@/utils/toast";

export default function PerformanceForm({
  performance,
  performanceRadioOptions,
  performanceRadioState,
  saleRadioOptions,
  saleRadioState,
  onSaleRadioChange,
  onPerformanceRadioChange,
  onClose,
  onApply,
}: {
  performance: Performance;
  performanceRadioOptions: { value: string; label: string }[];
  performanceRadioState: string;
  saleRadioOptions: { value: string; label: string }[];
  saleRadioState: string;
  onSaleRadioChange: (value: string) => void;
  onPerformanceRadioChange: (value: string) => void;
  onClose: () => void;
  onApply: () => void;
}) {
  const [isOpen, setIsOpen] = useState(true); // 공연 정보 모달 상태 관리
  const [isModalOpen, setIsModalOpen] = useState(false); // 변경여부 모달 상태 관리
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false); //변경사항 저장 확인 모달 상태 관리
  const [changeType, setChangeType] = useState<"sale" | "performance" | null>(
    null
  ); // 변경 유형: "sale" 또는 "performance"

  const handleSaleButtonClick = () => {
    setChangeType("sale");
    setIsModalOpen(true);
  };

  const handlePerformanceButtonClick = () => {
    setChangeType("performance");
    setIsModalOpen(true);
  };

  return (
    <>
      <div
        className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 ${
          isOpen ? "block" : "hidden"
        }`}
      >
        <div className="w-[330px] h-[75%] max-h-[560px] p-4 bg-white rounded-md">
          <div className="relative flex justify-center w-full">
            <h2 className="font-semibold text-center">공연 정보</h2>
            <CloseButton
              onClick={() => {
                setIsOpen(false);
                onClose();
              }}
              className="absolute right-0 top-0"
            />
          </div>

          {/* 공연 정보 내용 */}
          <section className="mt-4 text-xs">
            <h3 className="sr-only">공연정보</h3>
            <dl className="flex flex-wrap gap-x-1 gap-y-1 ">
              {[
                { label: "공연명", value: performance.title },
                { label: "카테고리", value: performance.category },
                { label: "팀명", value: performance.team },
                { label: "관리자명", value: "-" },
                { label: "등록일", value: "-" },
                {
                  label: "신고여부",
                  value:
                    performance.reportedStatus == "신고됨" ? (
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
            </dl>
          </section>

          <section className="mt-5">
            <h3 className="font-semibold text-sm py-2 border-t border-t-gray-300">
              판매 상태
            </h3>
            <Radio
              className="text-xs mt-1"
              checked={saleRadioState}
              onChange={onSaleRadioChange}
              items={saleRadioOptions}
            />
            <p className="text-xs text-gray-500 font-light mt-2 mb-4">
              (현재 상태 : <span>{saleRadioState}</span>)
            </p>
            <Button
              highlight
              size="small"
              onClick={handleSaleButtonClick} // 판매 상태 변경 버튼 클릭 시
            >
              상태 변경 적용
            </Button>
          </section>

          <section className="mt-5">
            <h3 className="font-semibold text-sm py-2 border-t border-t-gray-300">
              공연 표시 여부
            </h3>
            <Radio
              className="text-xs mt-1"
              checked={performanceRadioState}
              onChange={onPerformanceRadioChange}
              items={performanceRadioOptions}
            />
            <p className="text-xs text-gray-500 font-light mt-2 mb-4">
              (현재 상태 : <span>{performanceRadioState}</span>)
            </p>
            <Button
              highlight
              size="small"
              onClick={handlePerformanceButtonClick} // 공연 표시 여부 변경 버튼 클릭 시
            >
              상태 변경 적용
            </Button>
          </section>
        </div>
      </div>

      {/* 변경여부 모달 */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          className=" flex flex-col justify-center items-center"
        >
          <div className="z-[1000]">
            <p className="text-xs">
              {changeType === "sale"
                ? "판매상태를 변경하시겠습니까?"
                : performanceRadioState === "표시"
                  ? "해당 공연을 표시하시겠습니까?"
                  : "해당 공연을 숨김 처리하시겠습니까?"}
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
                  onApply();
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
          className="flex flex-col justify-center items-center"
        >
          <div className="z-[1000] flex flex-col items-center">
            <p className="text-xs">
              {changeType === "sale" ? (
                "성공적으로 변경되었습니다."
              ) : performanceRadioState === "숨김" ? (
                <div className="flex flex-col items-center">
                  <p className="text-center">성공적으로 숨김 처리되었습니다.</p>
                  <p className="text-[10px] text-gray-500 mt-1">
                    (소극장 관리자에게 즉시 알림 발송됩니다.)
                  </p>
                </div>
              ) : (
                "성공적으로 표시되었습니다."
              )}
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
