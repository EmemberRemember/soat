import { useState } from "react";
import { Radio } from "../controls/Inputs";
import BookSection from "./BookSection";
import ButtonRow from "./ButtonRow";

export default function PurchaseMethod({
  setProcess,
  performanceName,
  performanceDate,
  performanceTime,
  selectedSeats,
  ticketPrice,
  bookCompleteHandler,
}: {
  setProcess: (process: string) => void;
  performanceName: string;
  performanceDate: string;
  performanceTime: string;
  selectedSeats: Set<string>;
  ticketPrice: number;
  bookCompleteHandler: () => void;
}) {
  const [purchaseMethod, setPurchaseMethod] = useState("bank");

  return (
    <>
      <BookSection>
        <h3 className="font-bold text-xl">3. 티켓 정보</h3>
        <p>
          {performanceName},{" "}
          {new Date(performanceDate).toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
          , {performanceTime.replace(":", "시 ")}분
        </p>

        <ul className="list-disc ml-4">
          {Array.from(selectedSeats).map((seat) => (
            <li key={seat}>
              {seat} ({ticketPrice.toLocaleString("ko-KR")}원)
            </li>
          ))}
        </ul>
        <p>
          총 {selectedSeats.size}매, 합계{" "}
          {(ticketPrice * selectedSeats.size).toLocaleString("ko-KR")}원
        </p>
      </BookSection>
      <BookSection>
        <h3 className="font-bold text-xl">4. 결제 수단</h3>
        <Radio
          align="h"
          checked={purchaseMethod}
          onChange={setPurchaseMethod}
          items={[{ value: "bank", label: "무통장 입금" }]}
        />
      </BookSection>
      <ButtonRow
        setProcess={setProcess}
        bookCompleteHandler={bookCompleteHandler}
        buttons={[
          { label: "뒤로 가기", process: "purchaserInfo", highlight: false },
          { label: "예매하기", process: "bookComplete", highlight: true },
        ]}
      />
    </>
  );
}
