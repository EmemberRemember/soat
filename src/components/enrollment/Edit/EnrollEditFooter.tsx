"use client";
import { Button } from "@/components/controls/Button";
import { RootState } from "@/redux/store";
import { getImage } from "@/services/indexedDBService";
import { EnrollStep } from "@/types/enrollment";
import axios from "axios";
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import NavigationGuard from "../NavigationGuard";
import { useRouter } from "next/navigation";
import { useValidationEnrollment } from "@/hooks/useValidationEnrollment";
import {
  setEditInvalidField,
  setEditStep,
} from "@/redux/slices/enrollEditSlice";
import { showToast } from "@/utils/toast";

export default function EnrollEditFooter() {
  const router = useRouter();
  const step = useSelector((state: RootState) => state.enrollEdit.step);
  const enrollResult = useSelector((state: RootState) => state.enrollEdit);
  const seatResult = useSelector((state: RootState) => state.seatEdit);
  const isDirty = enrollResult.isDirty || seatResult.isDirty;
  const imageFiles = enrollResult.files;

  const { isValid, invalidFieldName } = useValidationEnrollment({
    enroll: enrollResult,
  });

  const dispatch = useDispatch();

  const validationNotify = () => {
    if (!isValid) {
      // 알림을 컴포넌트에서 처리
      switch (invalidFieldName) {
        case "enrollTitle":
          showToast("공연명을 입력해주세요", "error");
          break;
        case "category":
          showToast("공연의 카테고리를 설정해주세요", "error");
          break;
        case "bookingStartDate":
          showToast("공연 예약 시작 날짜를 설정해주세요.", "error");
          break;
        case "enrollBookingEndDate":
          showToast(
            "공연 예약 종료 날짜는 시작 날짜보다 빠를 수 없습니다.",
            "error"
          );
          break;
        case "enrollDetailAddress":
          showToast("주소를 입력해주세요.", "error");
          break;
        case "poster":
          showToast("포스터를 추가해주세요.", "error");
          break;
        case "performances":
          showToast("유효한 날짜에 공연을 등록해주세요", "error");
          break;
        default:
          break;
      }
    }
  };

  const handleOnClickSeatButton = () => {
    if (!isValid) {
      validationNotify();
    }

    if (invalidFieldName) {
      dispatch(setEditInvalidField(invalidFieldName));
      return;
    }

    dispatch(setEditStep(EnrollStep.EnrollSeats));
  };

  const handleOnClickPrevButton = () => {
    dispatch(setEditStep(EnrollStep.EnrollPerformance));
  };

  const getImageFileIndexedDB = async () => {
    const files = await Promise.all(imageFiles.map((key) => getImage(key)));
    return files;
  };

  const handleSubmit = async () => {
    try {
      const imagefiles = await getImageFileIndexedDB();

      const formData = new FormData();

      imagefiles.forEach((file) => {
        if (file && file.imageData) {
          const newfile = new File(
            [file.imageData],
            `${file.id}_${file.title}`,
            {
              type: file.imageType,
            }
          );
          formData.append(`image`, newfile);
        }
      });

      const { files: _files, ...rest } = {
        ...enrollResult,
        seats: seatResult,
      };
      const result = { ...rest };
      formData.append("data", JSON.stringify(result));
      const response = await axios.put("/api/enrollment", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 201) {
        showToast("공연 수정이 완료되었습니다.", "success", () => {
          router.push("/manager/performance");
        });
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        showToast(error.response?.data.error, "error");
      }
    }
  };

  return (
    <>
      <NavigationGuard isDirty={isDirty} />
      <footer className="fixed left-0 bottom-0 bg-flesh-200 w-full h-[120px] flex justify-end items-center pr-[60px] gap-14">
        {step === EnrollStep.EnrollSeats && (
          <Button type="button" onClick={handleOnClickPrevButton}>
            이전으로
          </Button>
        )}
        {step === EnrollStep.EnrollPerformance ? (
          <Button type="button" onClick={handleOnClickSeatButton}>
            좌석 배치하기
          </Button>
        ) : (
          <Button type="button" onClick={handleSubmit}>
            공연 수정
          </Button>
        )}
      </footer>
    </>
  );
}
