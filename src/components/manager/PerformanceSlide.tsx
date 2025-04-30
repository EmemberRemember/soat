import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PerformanceMoreBtn from "./PerformanceMoreBtn";
import { PerformanceDataWithStatus } from "./Performance";
import { useRouter } from "next/navigation";
import axios from "axios";
import useSetEditEnrollData from "@/hooks/useSetEditEnrollData";
import { showToast } from "@/utils/toast";

interface SliceProps {
  data: PerformanceDataWithStatus;
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
  const nowDate = new Date();
  const isNotYetBookingDate = new Date(bookingStartDate) > nowDate;
  const isBookingEnded = new Date(bookingEndDate) < nowDate;
  const isPerformanceEnded = new Date(getLastPerformanceDate()) < nowDate;
  const { setEditEnrollData, setEditSeatData } = useSetEditEnrollData();
  const router = useRouter();

  function getLastPerformanceDate() {
    const performanceDates = Object.keys(data.performances).sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );
    const finishPerformanceDate = performanceDates[0];

    if (Object.keys(data.performances).length > 0) {
      const lastTime = data.performances[finishPerformanceDate]
        .map(({ time }) => time)
        .sort((a, b) => Number(b) - Number(a))[0]
        .split(":");
      const lastPerformanceDate = new Date(finishPerformanceDate);
      lastPerformanceDate.setHours(
        Number(lastTime[0]),
        Number(lastTime[1]),
        59,
        59
      );
      return lastPerformanceDate;
    } else {
      return bookingEndDate;
    }
  }

  const terminatePerformance = async () => {
    const endConfirm = confirm("공연을 종료하시겠습니까?");
    if (endConfirm) {
      try {
        const response = await axios.patch(
          `/api/manager/performance/${performId}/end`
        );
        showToast("공연이 종료 되었습니다.", "success", () => {
          router.refresh();
        });
        // window.location.reload();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const deletePerformance = async () => {
    const deleteConfirm = confirm("공연을 삭제하시겠습니까?");
    if (deleteConfirm) {
      try {
        const response = await axios.delete(
          `/api/manager/performance/${performId}/delete`
        );
        showToast("공연이 삭제 되었습니다.", "success", () => {
          window.location.reload();
        });
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleOnEditPerformance = (e: React.MouseEvent<HTMLButtonElement>) => {
    handleButtonClick(e);
    setEditEnrollData(data);
    setEditSeatData(data.seats);
    router.push(`/enrollment/edit/${performId}`);
  };

  const handleOnCheckPerformance = (e: React.MouseEvent<HTMLButtonElement>) => {
    handleButtonClick(e);
    router.push(`/manager/performance/${performId}`);
  };

  const handleOnTerminatePerformance = (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    handleButtonClick(e);
    terminatePerformance();
  };

  const handleOnDeletePerformance = (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    handleButtonClick(e);
    deletePerformance();
  };

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
        {/* nowDate > new Date(bookingEndDate)는 공연 일자가 등록되지 않았지만 예매일자가 긴 데이터가 있어서 임시 구현 */}
        <CardContent className="p-0 relative">
          {(isBookingEnded && isPerformanceEnded) || data.status === "ended" ? (
            <Badge
              variant="outline"
              className="absolute top-2 left-2 text-white font-normal text-[10px] sm:text-xs md:text-sm"
            >
              {"공연 종료"}
            </Badge>
          ) : null}
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
              {bookingStartDate}
            </span>
            {isOpen && (
              <div className="mt-3">
                <PerformanceMoreBtn
                  onClickEditBtn={handleOnEditPerformance}
                  onClickCheckBtn={handleOnCheckPerformance}
                  onClickDeleteBtn={handleOnDeletePerformance}
                  onClickTerminateBtn={handleOnTerminatePerformance}
                  isPerformanceEnded={isPerformanceEnded}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </article>
  );
}
