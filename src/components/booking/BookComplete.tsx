import Image from "next/image";
import { Button } from "../controls/Button";
import BookSection from "./BookSection";
import ButtonRow from "./ButtonRow";
import { Card, CardContent, CardHeader } from "../ui/card";
import { LucideMessageCircleWarning } from "lucide-react";
import { bookResultType } from "@/types/reservation";
import { TossQRCode, tossUrl } from "@/components/booking/TossQRCode";
import Modal from "../Modal";
import { useShowModal } from "@/hooks/useShowModal";
import Ticket from "../ticket/Ticket";
import { CloseButton } from "../controls/Button";

export default function BookComplete(reservationData: bookResultType) {
  const { showModal, handleShowModal } = useShowModal();

  function showTicketModalHandler() {
    handleShowModal(true);
  }

  return (
    <>
      <BookSection>
        <h3 className="sr-only">예매 완료</h3>
        <p className="font-bold text-xl">예매가 완료되었습니다!</p>
        <dl>
          <dt className="font-bold">예매 번호</dt>
          <dd className="mb-2">{reservationData.bookingId}</dd>
          <dt className="font-bold">공연명</dt>
          <dd className="mb-2">{reservationData.bookTitle}</dd>
          <dt className="font-bold">공연 장소</dt>
          <dd className="mb-2">{reservationData.performanceLocation}</dd>
          <dt className="font-bold">관람 일시</dt>
          <dd className="mb-2">
            {new Date(reservationData.performanceDate).toLocaleDateString(
              "ko-KR",
              {
                year: "numeric",
                month: "long",
                day: "numeric",
              }
            )}
            {reservationData.performanceTime}
          </dd>
          <dt className="font-bold">좌석번호</dt>
          <dd className="mb-2">
            {reservationData.selectedSeats.map((seat) => {
              return (
                <span key={seat} className="mr-2">
                  {seat}
                </span>
              );
            })}
          </dd>
          <dt className="font-bold">입금 기한</dt>
          <dd className="mb-2">
            {new Date(reservationData.dueDate)
              .toLocaleTimeString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })
              .replace(":", "시 ")}
            분까지
          </dd>
        </dl>
      </BookSection>
      <BookSection>
        <h3 className="font-bold text-xl">결제하기</h3>
        <div className="w-fit ml-auto mr-auto grid grid-cols-2 grid-rows-2 justify-center items-center gap-x-4">
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
                  {reservationData.purchaserInfo.name}
                </strong>
                을(를) 꼭 적어주세요!
                <br />
                예매자 이름과 입금자 이름이 다를 경우,{" "}
                <strong>입금 확인이 어려울 수 있습니다.</strong>
              </p>
            </CardContent>
          </Card>
          <TossQRCode
            amount={reservationData.purchasingInfo.amount}
            bank={reservationData.purchasingInfo.bankName}
            accountNo={reservationData.purchasingInfo.accountNumber}
            msg={reservationData.purchaserInfo.name}
            className="w-36 h-36 p-2 bg-white ml-auto"
          />
          <ul className="font-bold">
            <li>{reservationData.purchasingInfo.bankName}</li>
            <li>{reservationData.purchasingInfo.accountNumber}</li>
            <li>예금주: {reservationData.purchasingInfo.accountHolder}</li>
            <li>
              {reservationData.purchasingInfo.amount.toLocaleString("ko-KR")}원
            </li>
          </ul>
          {/* 아래 버튼은 모바일에서만 보입니다. */}
          <Button
            className="col-span-2 ml-auto mr-auto"
            href={`${tossUrl({
              amount: reservationData.purchasingInfo.amount,
              bank: reservationData.purchasingInfo.bankName,
              accountNo: reservationData.purchasingInfo.accountNumber,
              msg: reservationData.purchaserInfo.name,
            })}`}
            target="_blank"
          >
            <Image
              className="inline-block mr-3"
              src="/images/icons/toss-128px.png"
              width={24}
              height={24}
              alt=""
            />
            토스 앱에서 송금하기
          </Button>
        </div>
      </BookSection>
      <ButtonRow
        setProcess={() => {}}
        showTicketModalHandler={showTicketModalHandler}
        buttons={[
          { label: "티켓 확인", process: "ticketCheck", highlight: false },
          { label: "닫기", process: "close", highlight: true },
        ]}
      />
      <>
        <Modal
          isOpen={showModal}
          onClose={() => handleShowModal(false)}
          className="relative p-[0px]"
        >
          <>
            <Ticket
              title={reservationData.bookTitle}
              performanceDate={reservationData.performanceDate}
              performanceTime={reservationData.performanceTime}
              address={reservationData.performanceLocation}
              detailAddress={reservationData.performanceDetailLocation}
              selectedSeats={reservationData.selectedSeats}
              reservationId={reservationData.bookingId}
              status={reservationData.paymentStatus}
            />
            <CloseButton
              className="absolute top-6 right-6"
              onClick={() => handleShowModal(false)}
            />
          </>
        </Modal>
      </>
    </>
  );
}
