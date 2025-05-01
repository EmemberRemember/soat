"use client";
import React, { useEffect, useState, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper as SwiperClass } from "swiper/types";
import "swiper/css";
import "swiper/css/pagination";
import { PerformanceData } from "@/app/api/performance/route";
import Link from "next/link";

const CATEGORIES = ["전체", "콘서트", "뮤지컬", "연극", "전시/행사", "팬미팅"];

export default function CurrentShowSection({
  data,
}: {
  data: PerformanceData[];
}) {
  const SHOWS = data;

  const [windowWidth, setWindowWidth] = useState(0);
  const [slidesPerView, setSlidesPerView] = useState(4);
  const [category, setCategory] = useState("전체");
  const [filteredShows, setFilteredShows] = useState(SHOWS);
  const useSwiper = filteredShows.length > 4;

  const swiperRef = useRef<{ swiper: SwiperClass } | null>(null);

  useEffect(() => {
    if (category === "전체") {
      setFilteredShows(
        SHOWS.sort(
          (a, b) =>
            new Date(a.bookingEndDate).getTime() -
            new Date(b.bookingEndDate).getTime()
        )
      );
    } else {
      const filtered = SHOWS.filter((show) => show.category === category);
      setFilteredShows(filtered);
    }
  }, [category]);

  useEffect(() => {
    setWindowWidth(window.innerWidth);

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (windowWidth < 640) {
      setSlidesPerView(1);
    } else if (windowWidth < 1024) {
      setSlidesPerView(2);
    } else {
      setSlidesPerView(4);
    }
  }, [windowWidth]);

  const handlePrev = () => {
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.slidePrev();
    }
  };

  const handleNext = () => {
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.slideNext();
    }
  };

  const showDate = (showDates: {}) => {
    const dates = Object.keys(showDates);
    if (dates.length === 1) {
      return dates[0];
    } else {
      return `${dates[0]} ~ ${dates[dates.length - 1]}`;
    }
  };

  const ShowCard = ({ show }: { show: PerformanceData }) => (
    <Link href={`/detail/${show.id}`}>
      <div className="flex flex-col h-full">
        <div className="relative w-full pt-[150%] mb-3">
          <img
            src={show.poster.url}
            alt={show.title}
            className="absolute top-0 left-0 w-full h-full rounded-xl cursor-pointer object-cover transition duration-300 hover:scale-95 hover:shadow-lg"
          />
        </div>
        <div className="flex flex-col flex-1">
          <p className="font-bold text-lg md:text-xl cursor-pointer">
            {show.title}
          </p>
          <p className="text-gray-500 text-xs md:text-sm mb-2 md:mb-4">
            {showDate(show.performances)}
          </p>
          <p className="text-sm md:text-base mt-auto">
            <span className="text-flesh-600 font-bold">예매가</span> :{" "}
            {show.price.toLocaleString() + "원"}
          </p>
        </div>
      </div>
    </Link>
  );

  return (
    <section className="container mx-auto px-4 py-5">
      <h2 className="font-bold text-2xl md:text-3xl">현재 예매중인 공연</h2>

      <nav className="py-5">
        <div className="flex items-center mb-2">
          <div className="overflow-x-auto flex-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            <ul className="flex gap-3 items-center whitespace-nowrap">
              {CATEGORIES.map((category) => (
                <li
                  key={category}
                  className="px-4 md:px-5 py-1 border-2 text-base md:text-lg rounded-lg hover:bg-flesh-300 hover:text-white hover:border-flesh-400 cursor-pointer shrink-0"
                  onClick={() => {
                    setCategory(category);
                  }}
                >
                  {category}
                </li>
              ))}
            </ul>
          </div>
          <Link href="/performances/booking">
            <div className="flex items-center ml-4 pl-2 bg-inherit">
              <p className="flex items-center gap-2 cursor-pointer shrink-0 hover:underline pb-2">
                더보기 <img src="images/icons/next-icon.svg" alt="더보기" />
              </p>
            </div>
          </Link>
        </div>
      </nav>

      {filteredShows.length === 0 ? (
        <p className="text-center text-lg text-gray-500 py-10">
          현재 선택한 카테고리에는 공연이 없습니다.
        </p>
      ) : (
        <>
          {useSwiper ? (
            <div className="relative px-8 md:px-12">
              <button
                onClick={handlePrev}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 
               bg-black text-white w-8 h-8 rounded-full flex items-center justify-center
               hover:bg-gray-800 transition-colors duration-300 focus:outline-none
               hidden md:flex"
                aria-label="이전 슬라이드"
              >
                <ChevronLeft absoluteStrokeWidth />
              </button>

              <button
                onClick={handleNext}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 
               bg-black text-white w-8 h-8 rounded-full flex items-center justify-center
               hover:bg-gray-800 transition-colors duration-300 focus:outline-none
               hidden md:flex"
                aria-label="다음 슬라이드"
              >
                <ChevronRight absoluteStrokeWidth />
              </button>

              <Swiper
                ref={swiperRef}
                modules={[Navigation, Pagination]}
                spaceBetween={24}
                slidesPerView={slidesPerView}
                navigation={false}
                pagination={{
                  clickable: true,
                  el: ".swiper-pagination",
                  type: "bullets",
                }}
                className="mySwiper"
              >
                {filteredShows.map((show) => (
                  <SwiperSlide key={show.id}>
                    <ShowCard show={show} />
                  </SwiperSlide>
                ))}
              </Swiper>

              <div className="swiper-pagination mt-6 relative"></div>
            </div>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {filteredShows.map((show) => (
                <li key={show.id}>
                  <ShowCard show={show} />
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <div className="w-full bg-gray-100 h-0.5 mt-10 md:mt-12"></div>
    </section>
  );
}
