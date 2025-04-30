import { useEffect, useState } from "react";
import { Checkbox, TextInput } from "../controls/Inputs";
import { Select } from "../controls/Select";
import BookSection from "./BookSection";
import ButtonRow from "./ButtonRow";
import axios from "axios";

export default function PurchaserInfo({
  setProcess,
  purchaserInfo,
  setPurchaserInfo,
}: {
  setProcess: (process: string) => void;
  purchaserInfo: {
    name: string;
    phone: string;
    email: string;
    // birth: string;
  };
  setPurchaserInfo: (info: {
    name: string;
    phone: string;
    email: string;
    // birth: string;
  }) => void;
}) {
  const today = new Date();

  const [isSameAsPurchaser, setIsSameAsPurchaser] = useState(false);
  const [purchaserName, setPurchaserName] = useState(purchaserInfo.name || "");
  const [purchaserPhone, setPurchaserPhone] = useState(
    purchaserInfo.phone || ""
  );
  const [purchaserEmail, setPurchaserEmail] = useState(
    purchaserInfo.email || ""
  );
  const [purchaserYear, setPurchaserYear] = useState(
    today.getFullYear().toString()
  );
  const [purchaserMonth, setPurchaserMonth] = useState(
    (today.getMonth() + 1).toString()
  );
  const [purchaserDay, setPurchaserDay] = useState(today.getDate().toString());

  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const response = await axios.get("/api/account/me");
        const userInfo = response.data;

        if (userInfo) {
          setPurchaserName(userInfo.user.username);
          setPurchaserPhone(userInfo.user.phoneNumber);
          setPurchaserEmail(userInfo.user.email);
          // setPurchaserYear(userInfo.birth.split("-")[0]);
          // setPurchaserMonth(userInfo.birth.split("-")[1]);
          // setPurchaserDay(userInfo.birth.split("-")[2]);
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    if (isSameAsPurchaser) {
      getUserInfo();
    }
  }, [isSameAsPurchaser, setIsSameAsPurchaser]);

  useEffect(() => {
    setPurchaserInfo({
      name: purchaserName,
      phone: purchaserPhone,
      email: purchaserEmail,
    });
  }, [purchaserName, purchaserPhone, purchaserEmail]);

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
        {/*회원 정보에 생년월일 데이터가 추가될 경우 아래 주석 해제*/}
        {/*<div>*/}
        {/*<label>생년월일</label>*/}
        {/*<ul className="grid grid-cols-3 w-full gap-x-2">*/}
        {/*  <li>*/}
        {/*    <Select*/}
        {/*      value={purchaserYear}*/}
        {/*      onChange={setPurchaserYear}*/}
        {/*      options={Array.from({ length: 120 }, (_, i) => ({*/}
        {/*        value: `${today.getFullYear() - i}`,*/}
        {/*        label: `${today.getFullYear() - i}년`,*/}
        {/*      }))}*/}
        {/*    />*/}
        {/*  </li>*/}
        {/*  <li>*/}
        {/*    <Select*/}
        {/*      value={purchaserMonth}*/}
        {/*      onChange={setPurchaserMonth}*/}
        {/*      options={Array.from({ length: 12 }, (_, i) => ({*/}
        {/*        value: `${i + 1}`,*/}
        {/*        label: `${i + 1}월`,*/}
        {/*      }))}*/}
        {/*    />*/}
        {/*  </li>*/}
        {/*  <li>*/}
        {/*    <Select*/}
        {/*      value={purchaserDay}*/}
        {/*      onChange={setPurchaserDay}*/}
        {/*      options={Array.from(*/}
        {/*        {*/}
        {/*          length: new Date(*/}
        {/*            +purchaserYear,*/}
        {/*            +purchaserMonth,*/}
        {/*            0*/}
        {/*          ).getDate(),*/}
        {/*        },*/}
        {/*        (_, i) => ({*/}
        {/*          value: `${i + 1}`,*/}
        {/*          label: `${i + 1}일`,*/}
        {/*        })*/}
        {/*      )}*/}
        {/*    />*/}
        {/*  </li>*/}
        {/*</ul>*/}
        {/*</div>*/}
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
