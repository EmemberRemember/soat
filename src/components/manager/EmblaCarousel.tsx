"use client"; // 클라이언트 컴포넌트로 설정

import React, { useEffect, useState, useCallback, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import PerformanceMoreBtn from "./PerformanceMoreBtn";

export default function EmblaCarousel() {
  const [clickedSlide, setClickedSlide] = useState<number | null>(null); // 클릭한 슬라이드 관리
  const carouselRef = useRef<HTMLDivElement | null>(null); // carouselRef의 타입을 명시

  const handleClick = (num: number) => {
    // 클릭한 슬라이드가 이미 선택된 슬라이드라면 닫기, 아니면 열기
    setClickedSlide((prevClickedSlide) =>
      prevClickedSlide === num ? null : num
    );
  };

  const [emblaRef, emblaApi] = useEmblaCarousel({
    slidesToScroll: 1,
    loop: false,
    align: "start",
  });

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setCurrentIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    return () => {
      if (emblaApi) {
        emblaApi.off("select", onSelect);
      }
    };
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    const onWheel = (event: WheelEvent) => {
      if (event.deltaY > 0) {
        emblaApi.scrollNext();
      } else {
        emblaApi.scrollPrev();
      }
    };

    const viewport = emblaApi.containerNode();
    viewport.addEventListener("wheel", onWheel);

    return () => {
      viewport.removeEventListener("wheel", onWheel);
    };
  }, [emblaApi]);

  const handleDocumentClick = (event: MouseEvent) => {
    // 클릭된 요소가 carousel 내부에 없으면 clickedSlide를 null로 설정
    if (
      carouselRef.current &&
      !carouselRef.current.contains(event.target as Node)
    ) {
      setClickedSlide(null); // 슬라이드 외부 클릭 시 닫히게 처리
    }
  };

  useEffect(() => {
    // 컴포넌트가 마운트될 때 이벤트 리스너 등록
    if (clickedSlide !== null) {
      document.addEventListener("mousedown", handleDocumentClick);
    } else {
      // 외부 클릭시 슬라이드 닫기
      document.removeEventListener("mousedown", handleDocumentClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
    };
  }, [clickedSlide]); // clickedSlide가 변경될 때마다 리스너를 다시 설정

  const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    handleDocumentClick(event.nativeEvent);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto py-8 px-3">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex" ref={carouselRef}>
          {[1, 2, 3, 4, 5].map((num) => (
            <div className="flex flex-col">
              <div
                className="flex flex-col"
                key={num}
                onClick={(event) => {
                  event.stopPropagation(); // 외부 클릭을 방지
                  handleClick(num); // 슬라이드 클릭 시 토글
                }}
              >
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
                    onClick={() => setClickedSlide(null)} // 슬라이드 외부 클릭 시 닫기
                  />
                  <PerformanceMoreBtn onClick={handleButtonClick} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
