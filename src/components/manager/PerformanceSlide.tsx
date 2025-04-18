import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PerformanceData } from "@/app/api/performance/route";
import PerformanceMoreBtn from "./PerformanceMoreBtn";
import { Timestamp } from "firebase/firestore";

interface SliceProps {
  data: PerformanceData;
  isOpen: boolean;
  handleClick: () => void;
  handleCardOutsideClick: () => void;
  handleButtonClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export default function PerformanceSlide({
  data,
  isOpen,
  handleClick,
  handleButtonClick,
  handleCardOutsideClick,
}: SliceProps) {
  const performId: string = data.id || "error";
  const bookingStartDate = data.bookingStartDate;
  const bookingEndDate = data.bookingEndDate;
  const isNotYetBookingDate = new Date(bookingStartDate) > new Date();

  function getLastPerformanceDate() {
    const performanceDates = Object.keys(data.performances).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );
    const finishPerformanceDate = performanceDates[0];
    if (Object.keys(data.performances).length > 0) {
      return finishPerformanceDate;
    } else {
      return bookingEndDate;
    }
  }

  return (
    <article
      key={data.id}
      className="flex-shrink-0 min-w-0 mb-5 cursor-pointer"
      onClick={() => handleCardOutsideClick()}
    >
      <Card
        className={`w-40 transition-all duration-200  ${
          isOpen ? "shadow-lg" : "hover:shadow-md"
        }`}
        onClick={(event) => {
          event.stopPropagation();
          handleClick();
        }}
      >
        {/* new Date() > new Date(bookingEndDate)는 공연 일자가 등록되지 않았지만 예매일자가 긴 데이터가 있어서 임시 구현 */}
        <CardContent className="p-0 relative">
          {new Date() > new Date(bookingEndDate) &&
            new Date(getLastPerformanceDate()) < new Date() && (
              <Badge
                variant={"outline"}
                className="absolute top-2 left-2 text-white font-normal text-[10px] sm:text-xs md:text-sm "
              >
                공연 종료
              </Badge>
            )}
          <img
            src={data.poster.url}
            alt={data.poster.fileName}
            className="h-60 rounded-t-md object-cover"
          />
          <div className="p-3">
            <Badge variant="outline" className="mb-2">
              {data.category}
            </Badge>
            <h3 className="font-medium text-sm truncate">{data.title}</h3>
            <span
              className={`
                text-sm 
                ${isNotYetBookingDate ? "text-destructive" : "text-gray-500"}
              `}
            >
              {/* {(data.createdAt instanceof Timestamp
                ? data.createdAt.toDate()
                : new Date(data.createdAt as string | number | Date)
              ).toLocaleDateString("ko-KR")} */}
              {bookingStartDate}
            </span>
            {isOpen && (
              <div className="mt-3">
                <PerformanceMoreBtn
                  onClick={handleButtonClick}
                  performId={performId}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </article>
  );
}
