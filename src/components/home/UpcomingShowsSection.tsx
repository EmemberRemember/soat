import { PerformanceData } from "@/app/api/performance/route";
import Link from "next/link";
import React from "react";

export default function UpcomingShowsSection({
  data,
}: {
  data: PerformanceData[];
}) {
  const shows = data.sort(
    (a, b) =>
      new Date(a.bookingEndDate).getTime() -
      new Date(b.bookingEndDate).getTime()
  );

  return (
    <section className="container mx-auto px-4">
      <h2 className="font-bold text-2xl md:text-3xl py-3 md:py-5">
        오픈 예정 공연
      </h2>

      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {shows.map((show) => (
          <li key={show.id} className="flex flex-col">
            <Link href={`/detail/${show.id}`}>
              <img
                src={show.poster.url}
                alt={show.title}
                className="w-full h-[200px] md:h-[233px] rounded-xl mb-2 md:mb-3 object-cover hover:shadow-md transition-all duration-200"
              />
              <p className="font-bold text-lg md:text-xl cursor-pointer">
                {show.title}
              </p>
              <p className="text-sm md:text-base">{show.detailAddress}</p>
              <p className="text-flesh-500 font-bold text-xs md:text-sm py-2 md:py-4">
                {show.bookingStartDate}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      <Link href="/performances/upcoming">
        <button className="px-6 md:px-8 py-3 md:py-4 border rounded-xl flex gap-2 md:gap-3 items-center text-lg md:text-xl mx-auto my-6 md:my-8 hover:bg-gray-50 active:bg-gray-100">
          오픈 예정 공연 전체보기
          <img
            src="images/icons/next-icon-defaltcolor.svg"
            alt="전체보기"
            className="w-5 md:w-auto"
          />
        </button>
      </Link>
    </section>
  );
}
