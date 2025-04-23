"use client";
import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useDispatch } from "react-redux";
import {
  setAddress,
  setBookingEndDate,
  setBookingStartDate,
  setCategory,
  setDetailAddress,
  setPostCode,
  setPrice,
  setTitle,
} from "@/redux/slices/enrollSlice";
import { KakaoAddressData } from "@/types/kakao";
import { TextInput } from "../controls/Inputs";
import KakaoAddressSearch from "../controls/KakaoAddressSearch";
import { focusRings } from "@/styles/constants";
import Category from "./Category";

export default function EnrollFormItems() {
  const {
    title,
    bookingStartDate,
    bookingEndDate,
    address,
    detailAddress,
    postCode,
    price,
    invalidField,
  } = useSelector((state: RootState) => state.enroll);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const detailAddressInputRef = useRef<HTMLInputElement>(null);

  const dispatch = useDispatch();

  const handleSearchAddress = (data: KakaoAddressData) => {
    const address = `${data.roadAddress} ${data.buildingName}`;
    dispatch(setAddress(address));
    dispatch(setPostCode(data.zonecode));
  };

  const handleOnChangeTitle = (newTitle: string) => {
    dispatch(setTitle(newTitle));
  };

  const handleOnChangeCategory = (newCategory: string) => {
    dispatch(setCategory(newCategory));
  };

  const handleOnChangePrice = (newPrice: string) => {
    // 숫자 변환 후 상태 업데이트
    if (isNaN(Number(newPrice))) {
      return;
    }
    dispatch(setPrice(Number(newPrice)));
  };

  const handleOnChangeBookingStartDate = (newDate: string) => {
    dispatch(setBookingStartDate(newDate));
  };

  const handleOnChangeBookingEndDate = (newDate: string) => {
    if (!validationBookinedEndDate(newDate)) {
      alert("예매 시작일보다 예매 종료일이 빠를 수 없습니다.");
      return;
    }
    dispatch(setBookingEndDate(newDate));
  };

  const validationBookinedEndDate = (newDate: string): boolean => {
    const endDate = new Date(newDate);
    const startDate = new Date(bookingStartDate);
    if (startDate > endDate) {
      return false;
    }
    return true;
  };
  const handleOnChangeDetailAddress = (newDetailAddress: string) => {
    dispatch(setDetailAddress(newDetailAddress));
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
        onChange={handleOnChangeTitle}
        ref={titleInputRef}
        name="enrollTitle"
      />
      <p>카테고리</p>
      <Category onClick={handleOnChangeCategory} />
      <TextInput
        label="가격"
        value={String(price)}
        onChange={handleOnChangePrice}
      />
      <TextInput
        label="예매시작일"
        type="date"
        value={bookingStartDate}
        onChange={handleOnChangeBookingStartDate}
      />
      <TextInput
        label="예매종료일"
        type="date"
        value={bookingEndDate}
        onChange={handleOnChangeBookingEndDate}
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
        onComplete={(data: KakaoAddressData) => handleSearchAddress(data)}
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
        onChange={(e) => handleOnChangeDetailAddress(e.target.value)}
        ref={detailAddressInputRef}
        name="enrollDetailAddress"
      />
    </>
  );
}
