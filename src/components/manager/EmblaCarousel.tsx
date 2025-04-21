"use client"; // 클라이언트 컴포넌트로 설정

import React, { useEffect, useState, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import axios from "axios";
import PerformanceSlide from "./PerformanceSlide";
import { PerformanceData } from "@/app/api/performance/route";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { TicketPlus } from "lucide-react";

interface CarouselDataProps {
  label: string;
}

export interface PerformanceDataWithStatus extends PerformanceData {
  status?: string;
}

export default function EmblaCarousel({ label }: CarouselDataProps) {
  const [clickedSlide, setClickedSlide] = useState<number | null>(null); // 클릭한 슬라이드 관리
  const [performanceList, setPerformanceList] = useState<PerformanceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
    async function fetchPerformanceList() {
      try {
        const response = await axios.get("/api/manager/performance");
        const nowDate = new Date();

        const getLastPerformanceDate = (performance: PerformanceData): Date => {
          const { performances, bookingEndDate } = performance;
          // 공연 일자가 등록되지 않거나 없는 경우 예매 종료일을 반환하도록 예외처리
          if (!performances || Object.keys(performances).length === 0) {
            const endDate = new Date(bookingEndDate);
            endDate.setHours(23, 59, 59, 59);
            return endDate;
          } else {
            // 실제 공연 종료일을 반환
            const lastDay = Object.keys(performances).sort(
              (a, b) => Date.parse(b) - Date.parse(a)
            )[0];
            const lastPerformances = performances[lastDay];
            const lastTime = lastPerformances
              .map(({ time }) => time)
              .sort((a, b) => Number(b) - Number(a))[0]
              .split(":");
            const lastPerformanceDate = new Date(lastDay);
            lastPerformanceDate.setHours(
              Number(lastTime[0]),
              Number(lastTime[1]),
              59,
              59
            );
            return lastPerformanceDate;
          }
        };

        if (label.includes("현재")) {
          // bookingStartDate이면서 실제 공연 종료일보다 적은 경우
          setPerformanceList(
            response.data.filter(
              (performance: PerformanceDataWithStatus) =>
                new Date(performance.bookingStartDate) < nowDate &&
                getLastPerformanceDate(performance) > nowDate &&
                performance.status !== "ended"
            )
          );
        } else if (label.includes("오픈 예정")) {
          // bookingStartDate가 현재 일자보다 적은 경우
          setPerformanceList(
            response.data.filter(
              (performance: PerformanceDataWithStatus) =>
                new Date(performance.bookingStartDate) > nowDate &&
                performance.status !== "ended"
            )
          );
        } else if (label.includes("완료")) {
          // 실제 공연 종료일이 현재 일자보다 적은 경우
          setPerformanceList(
            response.data.filter(
              (performance: PerformanceDataWithStatus) =>
                performance.status === "ended" ||
                getLastPerformanceDate(performance) < nowDate
            )
          );
        }

        setIsLoading(false);
      } catch (error) {
        console.error("공연 목록 불러오기 실패:", error);
      }
    }

    fetchPerformanceList();
  }, []);

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
    viewport.addEventListener("wheel", onWheel, { passive: true });

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

  // 슬라이드 이동 함수
  const handleClickPrevBtn = () => emblaApi?.scrollPrev();
  const handleClickNextBtn = () => emblaApi?.scrollNext();
  // 공통 버튼 스타일
  const navButtonClass =
    "absolute top-60 -translate-y-1/2 z-10 rounded-full bg-background/80 backdrop-blur-sm";

  return (
    <section className="relative w-full max-w-4xl mx-auto py-6 px-6">
      <h2 className="text-2xl font-bold mb-6">{label}</h2>
      {label.includes("진행중") && (
        <Link
          href="/enrollment"
          className="absolute right-6 top-5 bg-flesh-500 hover:bg-flesh-600 active:bg-flesh-700 text-sm px-4 py-2 rounded-md text-white flex items-center gap-2 transition duration-200"
        >
          <TicketPlus />
          공연 등록
        </Link>
      )}
      {performanceList.length > 0 ? (
        <>
          <Button
            variant="outline"
            size="icon"
            className={`${navButtonClass} left-4 md:left-0 -ml-4`}
            onClick={handleClickPrevBtn}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-4" ref={carouselRef}>
              {performanceList.map(
                (data: PerformanceDataWithStatus, index: number) => {
                  const num = index + 1; // 슬라이드 번호
                  return (
                    <PerformanceSlide
                      key={data.id}
                      data={data}
                      isOpen={clickedSlide === num}
                      handleClick={() => handleClick(num)}
                      handleCardOutsideClick={() => handleClick(0)}
                      handleButtonClick={handleButtonClick}
                    />
                  );
                }
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            className={`${navButtonClass} right-4 md:right-1 -mr-4`}
            onClick={handleClickNextBtn}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      ) : (
        <p className="flex justify-center text-lg text-gray-500 my-40">
          {isLoading
            ? "공연 목록을 불러오는 중입니다..."
            : "등록된 공연이 없습니다."}
        </p>
      )}
    </section>
  );
}
