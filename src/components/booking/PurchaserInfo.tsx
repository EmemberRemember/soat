import { useState } from "react";
import { Checkbox, TextInput } from "../controls/Inputs";
import { Select } from "../controls/Select";
import BookSection from "./BookSection";
import ButtonRow from "./ButtonRow";

export default function PurchaserInfo({
  setProcess,
}: {
  setProcess: (process: string) => void;
}) {
  const today = new Date();

  const [isSameAsPurchaser, setIsSameAsPurchaser] = useState(false);
  const [purchaserName, setPurchaserName] = useState("");
  const [purchaserPhone, setPurchaserPhone] = useState("");
  const [purchaserEmail, setPurchaserEmail] = useState("");
  const [purchaserYear, setPurchaserYear] = useState(
    today.getFullYear().toString()
  );
  const [purchaserMonth, setPurchaserMonth] = useState(
    (today.getMonth() + 1).toString()
  );
  const [purchaserDay, setPurchaserDay] = useState(today.getDate().toString());

  return (
    <>
      <BookSection>
        <h3 className="font-bold text-xl">2. 예매자 정보</h3>
        <Checkbox onChange={setIsSameAsPurchaser} checked={isSameAsPurchaser}>
          회원 정보와 같습니다.
        </Checkbox>
        <TextInput
          label="이름"
          type="text"
          value={purchaserName}
          onChange={setPurchaserName}
        />
        <div>
          <label>생년월일</label>
          <ul className="grid grid-cols-3 w-full gap-x-2">
            <li>
              <Select
                value={purchaserYear}
                onChange={setPurchaserYear}
                options={Array.from({ length: 120 }, (_, i) => ({
                  value: `${today.getFullYear() - i}`,
                  label: `${today.getFullYear() - i}년`,
                }))}
              />
            </li>
            <li>
              <Select
                value={purchaserMonth}
                onChange={setPurchaserMonth}
                options={Array.from({ length: 12 }, (_, i) => ({
                  value: `${i + 1}`,
                  label: `${i + 1}월`,
                }))}
              />
            </li>
            <li>
              <Select
                value={purchaserDay}
                onChange={setPurchaserDay}
                options={Array.from(
                  {
                    length: new Date(
                      +purchaserYear,
                      +purchaserMonth,
                      0
                    ).getDate(),
                  },
                  (_, i) => ({
                    value: `${i + 1}`,
                    label: `${i + 1}일`,
                  })
                )}
              />
            </li>
          </ul>
        </div>
        <TextInput
          label="휴대전화"
          type="tel"
          value={purchaserPhone}
          onChange={setPurchaserPhone}
        />
        <TextInput
          label="이메일"
          type="email"
          value={purchaserEmail}
          onChange={setPurchaserEmail}
        />
      </BookSection>
      <ButtonRow
        setProcess={setProcess}
        buttons={[
          { label: "뒤로 가기", process: "seat", highlight: false },
          { label: "다음", process: "purchaseMethod", highlight: true },
        ]}
      />
    </>
  );
}
