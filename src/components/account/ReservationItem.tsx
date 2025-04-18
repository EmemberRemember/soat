"use client";

import Link from "next/link";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";

const reservation = [
  {
    bookId: 1,
    image: "images/derme.jpg",
    title: "주인님 사랑해요!",
    viewDate: "2025.03.04",
    isViewComplete: true,
  },
  {
    bookId: 2,
    image: "images/derme.jpg",
    title: "카리나는 신이에요",
    viewDate: "2025.02.20",
    isViewComplete: true,
  },
  {
    bookId: 3,
    image: "images/derme.jpg",
    title: "라떼 is..horse☕🐎",
    viewDate: "2025.02.18",
    isViewComplete: true,
  },
  {
    bookId: 4,
    image: "images/derme.jpg",
    title: "고양이의 비밀스러운 삶",
    viewDate: "2025.01.15",
    isViewComplete: false,
  },
  {
    bookId: 5,
    image: "images/derme.jpg",
    title: "코딩의 신 되기",
    viewDate: "2025.02.05",
    isViewComplete: true,
  },
  {
    bookId: 6,
    image: "images/derme.jpg",
    title: "우주의 끝에서 만난 너",
    viewDate: "2025.03.12",
    isViewComplete: false,
  },
  {
    bookId: 7,
    image: "images/derme.jpg",
    title: "맛있는 떡볶이 레시피 100가지",
    viewDate: "2025.01.25",
    isViewComplete: true,
  },
  {
    bookId: 8,
    image: "images/derme.jpg",
    title: "눈물의 비가 내리는 밤",
    viewDate: "2025.02.28",
    isViewComplete: true,
  },
  {
    bookId: 9,
    image: "images/derme.jpg",
    title: "아이돌 연습생의 하루",
    viewDate: "2025.01.30",
    isViewComplete: false,
  },
  {
    bookId: 10,
    image: "images/derme.jpg",
    title: "블록체인으로 세상을 바꾸다",
    viewDate: "2025.03.08",
    isViewComplete: true,
  },
  {
    bookId: 11,
    image: "images/derme.jpg",
    title: "뉴진스의 하입보이 비하인드",
    viewDate: "2025.01.18",
    isViewComplete: true,
  },
  {
    bookId: 12,
    image: "images/derme.jpg",
    title: "사랑은 타이밍이다",
    viewDate: "2025.02.14",
    isViewComplete: true,
  },
  {
    bookId: 13,
    image: "images/derme.jpg",
    title: "도시의 낮과 밤",
    viewDate: "2025.03.01",
    isViewComplete: false,
  },
  {
    bookId: 14,
    image: "images/derme.jpg",
    title: "인공지능과 나의 미래",
    viewDate: "2025.01.22",
    isViewComplete: true,
  },
  {
    bookId: 15,
    image: "images/derme.jpg",
    title: "라면은 역시 틀어야 맛있다",
    viewDate: "2025.02.10",
    isViewComplete: false,
  },
  {
    bookId: 16,
    image: "images/derme.jpg",
    title: "국내여행 숨은 명소 TOP 50",
    viewDate: "2025.03.15",
    isViewComplete: true,
  },
  {
    bookId: 17,
    image: "images/derme.jpg",
    title: "서울의 밤은 당신의 것",
    viewDate: "2025.01.10",
    isViewComplete: true,
  },
  {
    bookId: 18,
    image: "images/derme.jpg",
    title: "반려동물과 행복한 생활",
    viewDate: "2025.02.25",
    isViewComplete: false,
  },
  {
    bookId: 19,
    image: "images/derme.jpg",
    title: "웹개발 마스터하기",
    viewDate: "2025.03.10",
    isViewComplete: true,
  },
  {
    bookId: 20,
    image: "images/derme.jpg",
    title: "조금 늦어도 괜찮아",
    viewDate: "2025.01.28",
    isViewComplete: true,
  },
];
interface ReservationDataProps {
  imageUrl: string;
  title: string;
  viewDate: string;
  bookId: number;
  isViewComplete?: boolean;
}
interface ReservationListDataProps {
  slice?: number;
  isViewComplete?: boolean;
}

function Ul({ children }: { children: React.ReactNode }) {
  return (
    <ul
      className={`flex gap-[10px] ${
        Array.isArray(children) && children.length > 3 && "flex-wrap"
      }`}
    >
      {children}
    </ul>
  );
}

function ReservationLi({
  imageUrl,
  title,
  viewDate,
  bookId,
  isViewComplete,
}: ReservationDataProps) {
  return (
    <li className="size-full w-[25vw] sm:w-[18vw] ">
      <Link href={`/account/mybook/${bookId}`}>
        <article>
          <Card className="relative hover:shadow-lg transition-all duration-200 ">
            <CardContent className="p-0">
              <img
                src={`/${imageUrl}`}
                alt="공연 info"
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
                  {"카테고리"}
                </Badge>
                <h3 className="text-[10px] font-bold text-black w-full sm:text-xs md:text-sm lg:text-lg truncate">
                  {title}
                </h3>
                <p className="text-[8px] text-gray-300 sm:text-xs md:text-sm lg:text-lg ">
                  {viewDate}
                </p>
              </div>
            </CardContent>
          </Card>
        </article>
      </Link>
    </li>
  );
}

export default function ReservationListData({
  slice = reservation.length,
  isViewComplete = false,
}: ReservationListDataProps) {
  return (
    <Ul>
      {reservation
        .filter((book) =>
          isViewComplete ? !!book.isViewComplete : !book.isViewComplete
        )
        .sort(
          (a, b) =>
            new Date(b.viewDate).getTime() - new Date(a.viewDate).getTime()
        )
        .slice(0, slice)
        .map((book) => {
          return (
            <ReservationLi
              key={book.bookId}
              bookId={book.bookId}
              imageUrl={book.image}
              title={book.title}
              viewDate={book.viewDate}
              isViewComplete={book.isViewComplete}
            />
          );
        })}
    </Ul>
  );
}
