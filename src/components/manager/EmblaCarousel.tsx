"use client";

import React, { useEffect, useState, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import PerformanceMoreBtn from "./PerformanceMoreBtn";

export default function SwiperCarousel() {
  const [clickedSlide, setClickedSlide] = useState<number | null>(null);
  const swiperRef = useRef<HTMLDivElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);

  const handleClick = (num: number) => {
    setClickedSlide((prevClickedSlide) =>
      prevClickedSlide === num ? null : num
    );
  };
  const handleDocumentClick = (event: MouseEvent) => {
    if (
      modalRef.current &&
      !modalRef.current.contains(event.target as Node) // ✅ 모달 외부 클릭 시 닫기
    ) {
      setClickedSlide(null);
    }
  };

  useEffect(() => {
    if (clickedSlide !== null) {
      document.addEventListener("mousedown", handleDocumentClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
    };
  }, [clickedSlide]);

  const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
  };

  return (
    <div
      className="relative w-full max-w-4xl mx-auto py-8 px-3"
      ref={swiperRef}
    >
      <Swiper
        spaceBetween={5}
        slidesPerView="auto"
        loop={false}
        onSlideChange={() => setClickedSlide(null)}
      >
        {[1, 2, 3, 4, 5].map((num) => (
          <SwiperSlide key={num} style={{ width: "auto" }}>
            <div className="flex flex-col" onClick={() => handleClick(num)}>
              <div className="flex-shrink-0 rounded-md mr-2 px-8 flex items-center justify-center h-60 bg-gray-200 text-2xl font-bold w-[142px] cursor-pointer">
                Slide {num}
              </div>
              <div className="w-[142px] font-bold overflow-hidden text-ellipsis whitespace-nowrap mt-2 px-1">
                2025 주인님 단독 콘서트 {num}
              </div>
            </div>
            {clickedSlide === num && (
              <div>
                <div
                  className="absolute top-0 left-0 w-full h-full bg-transparent"
                  onClick={() => setClickedSlide(null)}
                />
                <PerformanceMoreBtn onClick={handleButtonClick} />
              </div>
            )}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
