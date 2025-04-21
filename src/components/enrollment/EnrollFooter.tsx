"use client";
import { Button } from "@/components/controls/Button";
import { resetDirty, setStep } from "@/redux/slices/enrollSlice";
import { RootState } from "@/redux/store";
import { getImage } from "@/services/indexedDBService";
import { EnrollStep } from "@/types/enrollment";
import axios from "axios";
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import NavigationGuard from "./NavigationGuard";
import EnrollRehydration from "./EnrollRehydartion";

export default function EnrollFooter() {
  const step = useSelector((state: RootState) => state.enroll.step);
  const enrollResult = useSelector((state: RootState) => state.enroll);
  const seatResult = useSelector((state: RootState) => state.seat);
  const imageFiles = enrollResult.files;
  const isDirty = enrollResult.isDirty || seatResult.isDirty;
  const dispatch = useDispatch();

  const onClickTempStore = () => {
    dispatch(resetDirty());
  };

  const handleOnClickSeatButton = () => {
    dispatch(setStep(EnrollStep.EnrollSeats));
  };

  const handleOnClickPrevButton = () => {
    dispatch(setStep(EnrollStep.EnrollPerformance));
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
      const { files: _files, ...rest } = { ...enrollResult, seats: seatResult };
      const result = { ...rest };
      formData.append("data", JSON.stringify(result));
      const response = await axios.put("/api/enrollment", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 201) {
        alert("공연 등록이 완료되었습니다.");
        dispatch(setStep(EnrollStep.EnrollPerformance));
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        alert(error.response?.data.error);
      }
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
          <Button type="button" onClick={handleSubmit}>
            공연 등록
          </Button>
        )}
      </footer>
    </EnrollRehydration>
  );
}
