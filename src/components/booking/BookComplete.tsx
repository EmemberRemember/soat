import Image from "next/image";
import { Button } from "../controls/Button";
import BookSection from "./BookSection";
import ButtonRow from "./ButtonRow";
import QRCode from "react-qr-code";
import { Card, CardContent, CardHeader } from "../ui/card";
import { LucideMessageCircleWarning } from "lucide-react";

export default function BookComplete() {
  return (
    <>
      <BookSection>
        <h3 className="sr-only">예매 완료</h3>
        <p className="font-bold text-xl">예매가 완료되었습니다!</p>
        <dl>
          <dt className="font-bold">예매 번호</dt>
          <dd className="mb-2">A32BC76G2FF45</dd>
          <dt className="font-bold">공연명</dt>
          <dd className="mb-2">2025 주인님 단독 공연</dd>
          <dt className="font-bold">공연 장소</dt>
          <dd className="mb-2">인천광역시 어쩌구 멘토님 집</dd>
          <dt className="font-bold">관람 일시</dt>
          <dd className="mb-2">2025년 1월 22일 오후 8시</dd>
          <dt className="font-bold">좌석번호</dt>
          <dd className="mb-2">B4 / B5</dd>
          <dt className="font-bold">입금 기한</dt>
          <dd className="mb-2">2025년 1월 21일 오후 11시 59분까지</dd>
        </dl>
      </BookSection>
      <BookSection>
        <h3 className="font-bold text-xl">결제하기</h3>
        <div className="w-fit ml-auto mr-auto grid grid-cols-2 grid-rows-2 justify-center items-center gap-x-4">
          <QRCode
            className="w-24 h-24 p-2 bg-white ml-auto"
            value="https://example.com"
          />
          <ul className="font-bold">
            <li>새마을금고</li>
            <li>123-12-12345</li>
            <li>예금주: 김지훈</li>
            <li>18,000원</li>
          </ul>
          {/* 아래 버튼은 모바일에서만 보입니다. */}
          <Button className="col-span-2 ml-auto mr-auto">
            <Image
              className="inline-block mr-3"
              src="/images/icons/toss-128px.png"
              width={24}
              height={24}
              alt=""
            />
            토스 앱에서 송금하기
          </Button>
          <Card className="col-span-2 border-2 border-flesh-500 shadow-lg bg-flesh-50 overflow-hidden">
            <CardHeader className="font-bold bg-flesh-100 text-flesh-800 ">
              <p className="flex items-center text-lg">
                <LucideMessageCircleWarning
                  className="inline-block mr-2 text-flesh-600"
                  size={24}
                />
                <span className="font-extrabold">
                  송금 전에, 꼭 읽어주세요!
                </span>
              </p>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-flesh-700 leading-8">
                <strong className="underline decoration-2">
                  받는 분 내역 표시
                </strong>
                에 예매자 이름{" "}
                <strong className="bg-flesh-600 text-white px-1 rounded">
                  {`lorem`}
                </strong>
                을 꼭 적어주세요!
                <br />
                예매자 이름과 입금자 이름이 다를 경우,{" "}
                <strong>입금 확인이 어려울 수 있습니다.</strong>
              </p>
            </CardContent>
          </Card>
        </div>
      </BookSection>
      <ButtonRow
        setProcess={() => {}}
        buttons={[
          { label: "티켓 확인", process: "ticketCheck", highlight: false },
          { label: "닫기", process: "close", highlight: true },
        ]}
      />
    </>
  );
}
