import { useState } from "react";
import { Radio } from "../controls/Inputs";
import BookSection from "./BookSection";
import ButtonRow from "./ButtonRow";

export default function PurchaseMethod({
  setProcess,
}: {
  setProcess: (process: string) => void;
}) {
  const [purchaseMethod, setPurchaseMethod] = useState("bank");

  return (
    <>
      <BookSection>
        <h3 className="font-bold text-xl">3. 티켓 정보</h3>
        <p>2024 주인님 단독 공연</p>
        <ul className="list-disc ml-4">
          <li>2025년 2월 4일 / A3</li>
          <li>2025년 2월 4일 / A4</li>
        </ul>
        <p>총 2매, 합계 16,000원</p>
        <p>합계 16,000원</p>
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
        buttons={[
          { label: "뒤로 가기", process: "purchaserInfo", highlight: false },
          { label: "다음", process: "bookComplete", highlight: true },
        ]}
      />
    </>
  );
}
