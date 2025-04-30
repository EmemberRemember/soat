import Link from "next/link";
import { Item } from "@/app/search/page";
import useReservationHandler from "@/hooks/useReservationHandler";

export default function SearchResultItem({ item }: { item: Item }) {
  const {
    objectID,
    poster,
    title,
    bookingStartDate,
    bookingEndDate,
    price,
    sellerTeam,
    ratingCount,
    performances,
  } = item;
  const performanceDates = Object.keys(performances);
  const startDate = performanceDates[0];
  const endDate = performanceDates[performanceDates.length - 1];
  const saleStatus =
    new Date() < new Date(bookingStartDate)
      ? "판매예정"
      : new Date() < new Date(bookingEndDate)
      ? "판매중"
      : "판매종료";
  const isSalePending = saleStatus === "판매예정";
  const goToReservation = useReservationHandler(objectID);

  return (
    <li>
      <Link href={`/detail/${objectID}`}>
        <article className="py-[20px] flex items-center border-b border-b-gray-300 md:gap-4">
          {/* 공연 포스터 */}
          <img
            src={poster.url}
            alt={poster.fileName}
            className="w-[113px] h-[143px] cursor-pointer"
          />

          {/* 공연 정보 */}
          <div className="ml-4 flex-1">
            {/* 판매 상태 표시 */}
            <div className="flex items-center gap-[7px] text-[10px]">
              <div
                className={`border border-flesh-200 px-1 py-[0.7px] rounded-sm font-semibold 
                ${
                  saleStatus === "판매예정"
                    ? "bg-gray-300 text-gray-500 border-gray-300"
                    : ""
                }
                ${saleStatus === "판매중" ? "bg-white text-flesh-500" : ""}
                ${
                  saleStatus === "판매종료"
                    ? "bg-flesh-100 text-flesh-500 border-flesh-100"
                    : ""
                }`}
              >
                {saleStatus}
              </div>
            </div>

            {/* 공연 제목 */}
            <h3 className="font-semibold text-base mt-1 mb-[0.8px] cursor-pointer">
              {title}
            </h3>
            {/* 소극장 이름 */}
            <p className="text-xs font-light mb-[0.8px] md:mb-[0.5px]">
              {sellerTeam}
            </p>

            {/* 날짜 & 예매가 (데스크탑에서 가로 정렬) */}
            <div className="text-xs text-gray-400 font-light md:flex md:items-center md:justify-between md:mb-[4px]">
              <div className="md:flex-1 md:text-sm">
                {startDate} ~ {endDate}
              </div>
              <p className="hidden md:block text-flesh-600 font-semibold md:text-base ">
                예매가
                <span className="text-black"> {price.toLocaleString()}원</span>
              </p>
            </div>

            {/* 한줄평 (판매예정과 판매종료일 때는 보이지 않음) */}
            <p
              className={`text-xs mt-2 mb-2 font-light pl-4 bg-star-icon bg-no-repeat bg-left md:mt-1 md:mb-1 
    ${
      saleStatus === "판매예정" || saleStatus === "판매종료" ? "invisible" : ""
    }`}
            >
              한줄평({ratingCount || 0})
            </p>

            {/* 예매 버튼 */}
            <button
              className={`w-[65px] h-[25px] rounded-md text-white font-medium text-xs ${
                saleStatus === "판매종료"
                  ? "invisible"
                  : isSalePending
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-flesh-500 active:bg-flesh-600"
              }`}
              disabled={isSalePending || saleStatus === "판매종료"}
              onClick={(e) => {
                e.preventDefault();
                goToReservation();
              }}
            >
              예매하기
            </button>
          </div>
        </article>
      </Link>
    </li>
  );
}
