"use client";
import React, { useEffect, useRef } from "react";
import { KakaoAddressData } from "@/types/kakao";
import { TextInput } from "../controls/Inputs";
import KakaoAddressSearch from "../controls/KakaoAddressSearch";
import { focusRings } from "@/styles/constants";
import Category from "./Category";
import { useEnrollFormActions } from "@/hooks/useEnrollFormActions";
import { useEnrollmentData } from "@/hooks/useEnrollmentData";

interface EnrollFormItemsProps {
  isEdit ?: boolean
}
export default function EnrollFormItems({isEdit = false} : EnrollFormItemsProps) {
  const {
    title,
    bookingStartDate,
    bookingEndDate,
    address,
    detailAddress,
    postCode,
    price,
    invalidField,
  } = useEnrollmentData({ isEdit })
  const {
    onChangeTitle,
    onChangeCategory,
    onChangePrice,
    onChangeBookingStartDate,
    onChangeBookingEndDate,
    onSetAddress,
    onSetPostCode,
    onChangeDetailAddress,
  } = useEnrollFormActions({ isEdit });
  const titleInputRef = useRef<HTMLInputElement>(null);
  const detailAddressInputRef = useRef<HTMLInputElement>(null);


  const handleSearchAddress = (data: KakaoAddressData) => {
    const address = `${data.roadAddress} ${data.buildingName}`;
    onSetAddress(address);
    onSetPostCode(data.zonecode);
  };

  useEffect(() => {
    if (invalidField === "enrollTitle") {
      titleInputRef.current?.focus();
    }

    if (invalidField === "enrollDetailAddress") {
      detailAddressInputRef.current?.focus();
    }
  }, [invalidField]);

  return (
    <>
      <TextInput
        label="공연명"
        value={title}
        onChange={onChangeTitle}
        ref={titleInputRef}
        name="enrollTitle"
      />
      <p>카테고리</p>
      <Category onClick={onChangeCategory} />
      <TextInput
        label="가격"
        value={String(price)}
        onChange={onChangePrice}
      />
      <TextInput
        label="예매시작일"
        type="date"
        value={bookingStartDate}
        onChange={onChangeBookingStartDate}
      />
      <TextInput
        label="예매종료일"
        type="date"
        value={bookingEndDate}
        onChange={onChangeBookingEndDate}
      />
      <label className="block" htmlFor="detailLocation">
        위치
      </label>
      <input
        className={`border-2 rounded-lg px-4 py-2 flex-1 focus-visible:outline-none bg-background ${focusRings.default} mr-4 mb-2 w-[10rem]`}
        placeholder="우편번호"
        value={postCode}
        readOnly
      />
      <KakaoAddressSearch
        onComplete={handleSearchAddress}
      />
      <TextInput
        className="mb-2"
        type="text"
        placeholder="주소"
        value={address}
        readOnly
      />
      <input
        className={`border-2 rounded-lg px-4 py-2 flex-1 w-full focus-visible:outline-none bg-background ${focusRings.default}`}
        type="text"
        id="detailLocation"
        placeholder="상세 주소"
        value={detailAddress}
        onChange={(e)=>onChangeDetailAddress(e.target.value)}
        ref={detailAddressInputRef}
        name="enrollDetailAddress"
      />
    </>
  );
}
