"use client";
import React, { useMemo, useState } from "react";
import { TextInput } from "../controls/Inputs";
import { Button } from "../controls/Button";
import { EnrollModalProps } from "@/types/enrollment";
import { format } from "date-fns";
import { useEnrollmentData } from "@/hooks/useEnrollmentData";

export default function EnrollModal({
  selectedDates,
  onClose,
  onConfirm,
  initTime = "",
  initCasting = [],
  mode = "add",
  isParentEdit=false
}: EnrollModalProps) {
  const [time, setTime] = useState<string>(initTime);
  const [casting, setCasting] = useState<string[]>(initCasting);
  const { title } = useEnrollmentData({ isEdit: isParentEdit })
  
  const modalTitle = mode === "add" ? "공연 등록하기" : "공연 수정하기";
  const confirmButtonText = mode === "add" ? "등록" : "수정";
  const rangeDates = useMemo(() => {
    if (!selectedDates) return [];
    if (!Array.isArray(selectedDates))
      return [format(new Date(selectedDates), "yyyy-MM-dd")];

    const [start, end] = selectedDates;
    const dates = [];
    const current = new Date(start as Date);

    while (current <= new Date(end as Date)) {
      dates.push(format(new Date(current), "yyyy-MM-dd"));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }, [selectedDates]);

  const addCasting = () => {
    setCasting((prev) => [...prev, ""]);
  };

  const delCasting = () => {
    if (casting.length < 1) {
      return;
    }
    setCasting((prev) => prev.slice(0, -1));
  };

  const handleChangeCasting = (value: string, index: number) => {
    setCasting((prev) => {
      const newCasting = [...prev];
      newCasting[index] = value;
      return newCasting;
    });
  };

  const handleConfirm = () => {
    if (time.trim() === "") {
      alert("시간을 입력해주세요.");
      return;
    }

    if (casting.some((cast) => cast.trim() === "")) {
      alert("캐스팅을 모두 작성해주세요.");
      return;
    }

    onConfirm(rangeDates, time, casting);
    onClose();
  };

  return (
    <>
      <h3 className="sr-only">{modalTitle}</h3>
      <TextInput label="공연명" value={title} readOnly />
      <span>공연날짜</span>
      <div className="flex px-4 py-2 flex-1 w-full focus-visible:outline-none bg-background border-2 rounded-lg overflow-x-scroll">
        {rangeDates.map((date) => (
          <p
            className="bg-flesh-600 py-1 px-2 mr-2 text-background rounded-lg text-md whitespace-nowrap"
            key={date}
          >
            {date}
          </p>
        ))}
      </div>
      <TextInput label="공연시간" type="time" value={time} onChange={setTime} />
      <div className="flex mt-4 gap-4 justify-end ">
        <p className="mr-auto">캐스팅</p>
        <Button
          className=""
          type="button"
          onClick={delCasting}
          disabled={casting.length === 0}
        >
          제거
        </Button>
        <Button highlight type="button" onClick={addCasting}>
          추가
        </Button>
      </div>
      <section className="h-[200px] overflow-y-auto">
        {casting.map((cast, index) => (
          <TextInput
            label={`캐스팅${index + 1}`}
            key={index}
            value={cast}
            onChange={(newCasting) => handleChangeCasting(newCasting, index)}
          />
        ))}
      </section>

      <footer className="flex justify-between mt-4">
        <Button type="button" onClick={onClose}>
          취소
        </Button>
        <Button highlight type="button" onClick={handleConfirm}>
          {confirmButtonText}
        </Button>
      </footer>
    </>
  );
}
