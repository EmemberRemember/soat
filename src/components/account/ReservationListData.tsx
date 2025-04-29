"use client";

import Link from "next/link";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { bookWithPerformance } from "@/types/reservation";
import { Skeleton } from "../ui/skeleton";
interface ReservationListDataProps {
  slice?: number;
  data: bookWithPerformance[];
  isLoading: boolean;
}

export default function ReservationListData({
  slice,
  data,
  isLoading,
}: ReservationListDataProps) {
  const sliceData = slice ? [0, slice] : [0];
  const dataList = data.slice(...sliceData);
  const imgAspectStyle = "aspect-[7/6] sm:aspect-[90/130]";
  const listWidthStyle = "w-[25vw] sm:w-[18vw]";
  const skeletonStyle = `h-full rounded-xl  ${imgAspectStyle} ${listWidthStyle}`;

  return (
    <>
      {isLoading ? (
        <div className="flex flex-wrap gap-2 justify-center items-center mt-4">
          {Array.from({ length: slice ?? 12 }).map((_, index) => (
            <Skeleton key={index} className={skeletonStyle} />
          ))}
        </div>
      ) : (
        <ul
          className={`flex gap-[10px] justify-center ${
            Array.isArray(dataList) && dataList.length > 3 && "flex-wrap"
          }`}
        >
          {dataList.map((book: bookWithPerformance) => {
            const isViewComplete =
              new Date() >
              new Date(`${book.performanceDate}T${book.performanceTime}:00`);
            return (
              <li key={book.id} className={`size-full ${listWidthStyle}`}>
                <Link href={`/account/mybook/${book.id}`}>
                  <article>
                    <Card className="relative hover:shadow-lg transition-all duration-200 ">
                      <CardContent className="p-0">
                        <img
                          src={book.performanceDetails.poster}
                          alt={`${book.performanceDetails.title} 포스터`}
                          className={`bg-flesh-500 size-full rounded-t-md sm:mb-1  object-cover ${imgAspectStyle} ${
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
                            {book.performanceDetails.category}
                          </Badge>
                          <h3 className="text-[10px] font-bold text-black w-full sm:text-xs md:text-sm lg:text-lg truncate">
                            {book.performanceDetails.title}
                          </h3>
                          <p className="text-[8px] text-gray-300 sm:text-xs md:text-sm lg:text-lg ">
                            {book.performanceDate}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </article>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
