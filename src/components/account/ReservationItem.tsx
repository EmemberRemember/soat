"use client";

import Link from "next/link";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { bookWithPerformance } from "@/types/reservation";
interface ReservationListDataProps {
  slice?: number;
  data: bookWithPerformance[]
}

export default function ReservationListData({
  slice,
  data
}: ReservationListDataProps) {  
  const sliceData = slice ? [0, slice] : [0];
  const dataList = data.slice(...sliceData);
  return (
    <ul
    className={`flex gap-[10px] ${
      Array.isArray(dataList) && dataList.length > 3 && "flex-wrap"
    }`}
  >
    {dataList
      .map((book) => {
        return (
          <ReservationLi
            key={book.bookingId}
            data={book}
          />
        );
      })}
  </ul>
  );
}

function ReservationLi({
 data
}: {data : bookWithPerformance}) {
  const isViewComplete = new Date() > new Date(`${data.performanceDate}T${data.performanceTime}:00`);

  return (
    <li  className="size-full w-[25vw] sm:w-[18vw]">
      <Link href={`/account/mybook/${data.id}`}>
        <article>
          <Card className="relative hover:shadow-lg transition-all duration-200 ">
            <CardContent className="p-0">
              <img
                src={data.performanceDetails.poster}
                alt={`${data.performanceDetails.title} 포스터`}
                className={`bg-flesh-500 size-full rounded-t-md sm:mb-1 aspect-[7/6] sm:aspect-[90/130] object-cover ${
                  isViewComplete && "blur-[1px]"
                }`}
              />

              <div className="p-1 sm:p-3">
                {isViewComplete && (
                  <Badge
                    variant={"outline"}
                    className="absolute top-2 left-2 text-white bg-background/80 backdrop-blur-sm text-[10px] sm:text-xs md:text-sm "
                  >
                    관람완료
                  </Badge>
                )}

                <Badge
                  variant={"outline"}
                  className="px-1 sm:px-3 sm:mb-3 text-[10px] sm:text-xs md:text-sm"
                >
                  {data.performanceDetails.category}
                </Badge>
                <h3 className="text-[10px] font-bold text-black w-full sm:text-xs md:text-sm lg:text-lg truncate">
                  {data.performanceDetails.title}
                </h3>
                <p className="text-[8px] text-gray-300 sm:text-xs md:text-sm lg:text-lg ">
                  {data.performanceDate}
                </p>
              </div>
            </CardContent>
          </Card>
        </article>
      </Link>
    </li>
  );
}