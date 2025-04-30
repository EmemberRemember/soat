"use client";
import { Button } from "@/components/controls/Button";
import {
  resetDirty,
  setInvalidField,
  setStep,
} from "@/redux/slices/enrollSlice";
import { persistor, RootState } from "@/redux/store";
import { clearAllImages, getImage } from "@/services/indexedDBService";
import { EnrollStep } from "@/types/enrollment";
import axios from "axios";
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import NavigationGuard from "../NavigationGuard";
import EnrollRehydration from "./EnrollRehydartion";
import { useRouter } from "next/navigation";
import { useValidationEnrollment } from "@/hooks/useValidationEnrollment";
import Loading from "@/components/Loading";
import { showToast } from "@/utils/toast";

export default function EnrollFooter() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const step = useSelector((state: RootState) => state.enroll.step);
  const enrollResult = useSelector((state: RootState) => state.enroll);
  const seatResult = useSelector((state: RootState) => state.seat);
  const imageFiles = enrollResult.files;
  const poster = enrollResult.poster;
  const isDirty = enrollResult.isDirty || seatResult.isDirty;
  const { isValid, invalidFieldName } = useValidationEnrollment({
    enroll: enrollResult,
  });

  const dispatch = useDispatch();

  const onClickTempStore = () => {
    dispatch(resetDirty());
  };

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
          showToast("공연 예약 날짜를 설정해주세요.", "error");
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
      dispatch(setInvalidField(invalidFieldName));
      return;
    }

    dispatch(setStep(EnrollStep.EnrollSeats));
  };

  const handleOnClickPrevButton = () => {
    dispatch(setStep(EnrollStep.EnrollPerformance));
  };

  const getImageFileIndexedDB = async () => {
    const files = await Promise.all(imageFiles.map((key) => getImage(key)));
    return files;
  };

  const getPosterFileIndexedDB = async () => {
    if (poster && poster.fileKey) {
      const files = await getImage(poster?.fileKey);
      return files;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const imagefiles = await getImageFileIndexedDB();
      const posterfile = await getPosterFileIndexedDB();
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

      if (posterfile && posterfile.imageData) {
        const newFile = new File(
          [posterfile.imageData],
          `${posterfile.id}_${posterfile.title}`,
          { type: posterfile.imageType }
        );
        formData.append("poster", newFile);
      }

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
        persistor.purge();
        await clearAllImages();
        showToast("공연 등록이 완료되었습니다.", "success", () => {
          router.push("/manager/performance");
        });
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        showToast(error.response?.data.error, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <EnrollRehydration>
      <NavigationGuard isDirty={isDirty} />
      <footer className="fixed left-0 bottom-0 bg-flesh-200 w-full h-[120px] flex justify-end items-center pr-[60px] gap-14">
        <Button onClick={onClickTempStore} type="button">
          임시 저장
        </Button>
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
          <Button type="button" onClick={handleSubmit} disabled={loading}>
            공연 등록
          </Button>
        )}
      </footer>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        {loading && <Loading />}
      </div>
    </EnrollRehydration>
  );
}
