import Link from "next/link";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { bookWithPerformance } from "@/types/reservation";
import { ReservationDataProps } from "./ReservationList";

interface ReservationListDataProps extends ReservationDataProps {
  isPreviewData?: boolean;
}

export default async function ReservationListData({
  data,
  isPreviewData,
  dataType = "all",
}: ReservationListDataProps) {
  const now = new Date();
  const sortedData = data.sort(
    (a: bookWithPerformance, b: bookWithPerformance) => {
      const dateA = new Date(`${a.performanceDate}T${a.performanceTime}:00`);
      const dateB = new Date(`${b.performanceDate}T${b.performanceTime}:00`);
      if (dataType === "upComing") {
        return dateA.getTime() - dateB.getTime();
      } else {
        return dateB.getTime() - dateA.getTime();
      }
    }
  );
  const bookData = sortedData.filter((bookData: bookWithPerformance) => {
    if (dataType === "upComing") {
      return (
        now <
        new Date(`${bookData.performanceDate}T${bookData.performanceTime}:00`)
      );
    } else if (dataType === "past") {
      return (
        now >
        new Date(`${bookData.performanceDate}T${bookData.performanceTime}:00`)
      );
    }
    return bookData;
  });

  const imgAspectStyle = "aspect-[7/6] sm:aspect-[90/130]";
  const listWidthStyle = "w-[25vw] sm:w-[18vw]";
  // const skeletonStyle = `h-full rounded-xl ${imgAspectStyle} ${listWidthStyle} ${"flex-1"}`;
  const sliceData = isPreviewData ? bookData.slice(0, 3) : bookData;

  return (
    <>
      {/* {sliceData.length < 1 ? (
        <div className="flex flex-wrap gap-2 justify-center items-center mt-4">
          {Array(isPreviewData ? 3 : 12).map((_, index) => (
            <Skeleton key={index} className={skeletonStyle} />
          ))}
        </div>
      ) : (       )}*/}
      <ul
        className={`flex gap-[10px] ${
          !isPreviewData ? "flex-wrap justify-start" : "justify-center"
        }`}
      >
        {sliceData.map((book: bookWithPerformance) => {
          const isViewComplete =
            new Date() >
            new Date(`${book.performanceDate}T${book.performanceTime}:00`);
          const bookedType = book.paymentStatus;
          return (
            <li
              key={book.reservationId}
              className={`size-full ${listWidthStyle}`}
            >
              <Link href={`/account/mybook/${book.reservationId}`}>
                <article>
                  <Card className="relative hover:shadow-lg transition-all duration-200 ">
                    <CardContent className="p-0">
                      <img
                        src={book.performanceDetails.poster}
                        alt={`${book.performanceDetails.title} 포스터`}
                        className={`size-full rounded-t-md sm:mb-1 object-cover ${imgAspectStyle} ${
                          isViewComplete && "blur-[1px]"
                        }`}
                      />
                      <div className="p-1 sm:p-3">
                        {isViewComplete && bookedType === "booked" && (
                          <Badge
                            variant={"outline"}
                            className="absolute top-2 left-2 text-flesh-300 bg-background/90 backdrop-blur-lg text-[10px] sm:text-xs md:text-sm "
                          >
                            관람 완료
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
    </>
  );
}
