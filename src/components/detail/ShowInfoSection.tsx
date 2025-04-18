"use client";
import React, { useState } from "react";
import Modal from "./../Modal";
import { Button } from "../controls/Button";
import NaverMapModal from "./NaverMap";
import { PerformanceData } from "@/app/api/performance/route";
import { Share, Link } from "lucide-react";
import useReservationHandler from "@/hooks/useReservationHandler";

export default function ShowInfoSection({
  performanceData,
}: {
  performanceData: PerformanceData;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const goToReservation = useReservationHandler(performanceData.id || "");

  const title = performanceData.title || "";
  const performanceDates = Object.keys(performanceData.performances);
  const startDate = performanceDates[0];
  const endDate = performanceDates[performanceDates.length - 1];
  const locationName = performanceData.detailAddress || "";
  const locationAddress = performanceData.address || "";
  const price = performanceData.price || "";
  const category = performanceData.category || "";
  const posterUrl = performanceData.poster.url || "";
  const isBookingEnabled =
    new Date() < new Date(performanceData.bookingStartDate) ||
    new Date() > new Date(performanceData.bookingEndDate);

  const handleShare = async () => {
    const shareData = {
      title: title,
      text: "공연정보",
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log("공유 취소 또는 실패:", error);
        setModalMessage("공유를 취소했거나 실패했습니다.");
      }
    } else {
      setModalMessage(
        "이 브라우저에서는 공유 기능을 지원하지 않습니다. URL을 복사해주세요."
      );
    }
  };

  const handleCopyUrl = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => {
          setModalMessage("공연정보가 클립보드에 복사되었습니다!");
        })
        .catch(() => {
          setModalMessage("클립보드 복사에 실패했습니다.");
        });
    }
  };

  const handleMapButtonClick = () => {
    setIsMapModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalMessage("");
  };

  return (
    <section className="flex flex-col md:flex-row py-8 md:py-16 gap-6 md:gap-12 px-4 md:px-0">
      {/* 공연 포스터 */}
      <div className="w-full md:w-80">
        <div className="relative w-full pt-[150%] md:w-80 md:h-[460px]">
          <img
            src={posterUrl}
            alt="포스터"
            className="absolute top-0 left-0 w-full h-full rounded-xl object-cover"
          />
        </div>
      </div>

      {/* 공연 정보 */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="border-b border-gray-200 pb-4 mb-6 md:mb-8">
            <div className="flex justify-between items-start md:items-center">
              <div>
                <h2 className="text-2xl md:text-4xl font-bold mb-2">{title}</h2>
                <p className="text-lg md:text-xl text-gray-500">
                  {startDate} ~ {endDate}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(true);
                }}
              >
                <img
                  src="/images/icons/share-icon.svg"
                  alt="공유하기"
                  className="ml-4 w-6 md:w-auto"
                />
              </button>
            </div>
          </div>

          {/* 상세 정보 리스트 */}
          <ul className="space-y-4 md:space-y-6">
            <li>
              <p className="flex items-center gap-2 text-lg md:text-2xl text-neutral-700">
                <span className="font-semibold whitespace-nowrap self-start">
                  장소 :
                </span>
                {locationAddress}&nbsp;
                {locationName}
                <button
                  onClick={handleMapButtonClick}
                  className="flex items-center hover:opacity-75 transition-opacity"
                >
                  <img
                    src="/images/icons/map-icon.svg"
                    alt="지도보기"
                    className="w-5 md:w-6 h-5 md:h-6 ml-1 md:ml-2"
                  />
                </button>
              </p>
            </li>
            <li>
              <p className="flex items-center gap-2 text-lg md:text-2xl text-neutral-700">
                <span className="font-semibold">예매가 :</span>
                {price.toLocaleString()}원
              </p>
            </li>
            <li>
              <p className="flex items-center gap-2 text-lg md:text-2xl text-neutral-700">
                <span className="font-semibold">카테고리 :</span>
                {category}
              </p>
            </li>
          </ul>
        </div>
        <p className={isBookingEnabled ? "text-flesh-500" : "text-gray-500"}>
          예매 기간
          {isBookingEnabled
            ? `(${performanceData.bookingStartDate} ~
          ${performanceData.bookingEndDate})이 아닙니다.`
            : ` : ${performanceData.bookingStartDate} ~
          ${performanceData.bookingEndDate}`}
        </p>
        {/* 예매 버튼 */}
        <Button
          highlight
          size="full"
          className="text-white px-6 md:px-20 py-3 md:py-4 rounded-lg text-xl md:text-2xl mt-8 md:mt-0"
          onClick={() => goToReservation()}
          disabled={isBookingEnabled}
        >
          예매하기
        </Button>
      </div>

      {/* 공유 모달 */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        className="max-w-sm text-center  mx-4 md:mx-0 flex flex-col items-center  "
      >
        <>
          <h3 className="text-2xl font-bold mb-5">공연정보 공유하기</h3>
          <div className="flex gap-6">
            <div className="flex flex-col gap-2">
              <Button
                onClick={handleShare}
                className="flex flex-col gap-2 items-center bg-flesh-500 px-3 rounded-full py-3 cursor-pointer "
              >
                <Share size={50} color="#FFFFFF" />
              </Button>
              <p>다른앱으로 공유</p>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                className="flex flex-col gap-2 items-center bg-flesh-500 px-3 rounded-full py-3 cursor-pointer"
                onClick={handleCopyUrl}
              >
                <Link size={50} color="#FFFFFF" />
              </Button>
              복사하기
            </div>
          </div>
          <p className="mt-4">{modalMessage}</p>
        </>
      </Modal>

      {/* 지도 모달 */}
      <NaverMapModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        locationName={locationName}
        locationAddress={locationAddress}
      />
    </section>
  );
}
