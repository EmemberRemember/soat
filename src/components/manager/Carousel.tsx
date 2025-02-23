"use client";

import React, { useEffect, useState, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import PerformanceMoreBtn from "./PerformanceMoreBtn";

export default function SwiperCarousel() {
  const [clickedSlide, setClickedSlide] = useState<number | null>(null);
  const swiperRef = useRef<HTMLDivElement | null>(null);

  const handleClick = (num: number) => {
    setClickedSlide((prevClickedSlide) =>
      prevClickedSlide === num ? null : num
    );
  };

  const handleDocumentClick = (event: MouseEvent) => {
    if (swiperRef.current && swiperRef.current.contains(event.target as Node)) {
      return; // 슬라이드 내부 클릭 시 닫히지 않음
    }
    setClickedSlide(null); // 슬라이드 외부 클릭 시 모달 닫기
  };

  useEffect(() => {
    if (clickedSlide !== null) {
      document.addEventListener("mousedown", handleDocumentClick);
    } else {
      document.removeEventListener("mousedown", handleDocumentClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
    };
  }, [clickedSlide]);

  const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation(); // 모달 내부 클릭 시 이벤트 전파 방지
  };

  return (
    <div
      className="relative w-full max-w-4xl mx-auto py-8 px-3 overflow-visible"
      ref={swiperRef}
    >
      <Swiper
        spaceBetween={5}
        slidesPerView="auto"
        loop={false}
        onSlideChange={() => setClickedSlide(null)}
        style={{ overflow: "visible" }} // Swiper 전체를 overflow: visible로 설정
      >
        {[1, 2, 3, 4, 5].map((num) => (
          <SwiperSlide key={num} style={{ width: "auto", overflow: "visible" }}>
            <div
              className="relative flex flex-col"
              onClick={() => handleClick(num)}
            >
              <div className="flex-shrink-0 rounded-md mr-2 px-8 flex items-center justify-center h-60 bg-gray-200 text-2xl font-bold w-[142px] cursor-pointer">
                Slide {num}
              </div>
              <div className="w-[142px] font-bold overflow-hidden text-ellipsis whitespace-nowrap mt-2 px-1">
                2025 주인님 단독 콘서트 {num}
              </div>

              {clickedSlide === num && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 z-50 mt-2 min-w-[150px] max-w-[300px] p-4">
                  <PerformanceMoreBtn onClick={handleButtonClick} />
                </div>
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
