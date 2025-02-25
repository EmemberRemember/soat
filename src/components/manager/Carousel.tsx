"use client";

import React, { useEffect, useState, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import PerformanceMoreBtn from "./PerformanceMoreBtn";

export default function SwiperCarousel() {
  const [clickedSlide, setClickedSlide] = useState<number | null>(null);
  const swiperRef = useRef<HTMLDivElement | null>(null);

  // 슬라이드 클릭 시 모달 열기
  const handleClick = (num: number, event: React.MouseEvent) => {
    event.stopPropagation(); // 이벤트 전파 방지

    setClickedSlide((prevClickedSlide) => {
      if (prevClickedSlide === num) {
        return null;
      } else {
        return num;
      }
    });
  };

  // 슬라이드 외부 클릭 시 모달 닫기
  const handleDocumentClick = (event: MouseEvent) => {
    if (swiperRef.current && swiperRef.current.contains(event.target as Node)) {
      return; // 슬라이드 내부 클릭 시 닫히지 않음
    }
    if (clickedSlide !== null) {
      setClickedSlide(null); // 외부 클릭 시 모달 닫기
    }
  };

  useEffect(() => {
    // 슬라이드 외부 클릭 시 이벤트 리스너 추가
    if (clickedSlide !== null) {
      document.addEventListener("mousedown", handleDocumentClick);
    } else {
      document.removeEventListener("mousedown", handleDocumentClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
    };
  }, [clickedSlide]);

  // 모달 내부 클릭 시 전파 방지
  const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
  };

  return (
    <div
      className="relative w-full h-[500px] max-w-4xl mx-auto py-8 px-3 overflow-hidden"
      ref={swiperRef}
    >
      <Swiper
        spaceBetween={5}
        slidesPerView="auto"
        loop={false}
        className="h-full overflowX-hidden"
      >
        {[1, 2, 3, 4, 5].map((num) => (
          <SwiperSlide key={num} style={{ width: "auto", overflow: "visible" }}>
            <div
              className="relative flex flex-col"
              onClick={(event) => handleClick(num, event)} // 슬라이드 클릭 시 해당 슬라이드 열기
            >
              <div className="flex-shrink-0 rounded-md mr-2 px-8 flex items-center justify-center h-60 bg-gray-200 text-2xl font-bold w-[142px] cursor-pointer">
                Slide {num}
              </div>
              <div className="w-[142px] font-bold overflow-hidden text-ellipsis whitespace-nowrap mt-2 px-1">
                2025 주인님 단독 콘서트 {num}
              </div>

              {clickedSlide === num && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 z-100 mt-2 min-w-[150px] max-w-[300px] p-4">
                  <PerformanceMoreBtn onClick={handleButtonClick} />
                </div>
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* {clickedSlide !== null && (
        <div
          className="absolute inset-0 cursor-pointer z-40"
          onClick={() => setClickedSlide(null)} // 슬라이드 외부 클릭 시 모달 닫기
        />
      )} */}
    </div>
  );
}
