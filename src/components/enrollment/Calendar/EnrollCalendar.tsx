"use client";
import React, { useMemo, useState } from "react";
import Calendar from "react-calendar";
import { Button } from "../../controls/Button";
import { CalendarValue, EnrollModalMode } from "@/types/enrollment";
import { Value } from "react-calendar/dist/esm/shared/types.js";
import Modal from "@/components/Modal";
import EnrollModal from "../EnrollModal";
import { format } from "date-fns";
import PerformanceInfo from "../write/PerformanceInfo";
import "./enrollCalendar.css";
import { useShowModal } from "@/hooks/useShowModal";
import { usePerformanceActions } from "@/hooks/usePerformanceActions";
import { useEnrollmentData } from "@/hooks/useEnrollmentData";

interface EnrollCalendar {
  isEdit?: boolean;
}
export default function EnrollCalendar({isEdit = false} : EnrollCalendar) {
  const [value, setValue] = useState<CalendarValue>(null);
  const {showModal, handleShowModal } = useShowModal();
  const [modalMode, setModalMode] = useState<EnrollModalMode>("add");
  const [isRange, setIsRange] = useState<boolean>(false);
  const [initTime, setInitTime] = useState<string>(""); //modal에서 쓰이는 state
  const [initCasting, setInitCasting] = useState<string[]>([]); //modal에서 쓰이는 state
  const [selectedPerformanceIndex, setSelectedPerformanceIndex] = useState<
  number | null
  >(null);
  const { performances } = useEnrollmentData({isEdit})
   const { onAddPerformance, onEditPerformance } = usePerformanceActions({ isEdit }); // Use the new hook
 
  const selectedEvent = useMemo(() => {
    if (Array.isArray(value) || !value) {
      //범위 선택이거나 등록된 공연이 없으면
      return null;
    }
    const formattedDate = format(new Date(value), "yyyy-MM-dd");
    return performances[formattedDate] || null;
  }, [value, performances]);


  const handleOpenEnrollModal = (state: boolean) => {
    handleShowModal(state);
    resetModalData();
  };

  const handleAddButton = () => {
    setModalMode("add"); //모달의 모드 설정
    setIsRange(false); //범위 선택 종료
    handleOpenEnrollModal(true);
  };

  const handleConfirm = (
    selectedDates: string[],
    time: string,
    casting: string[]
  ) => {
    if (modalMode === "add") {
      onAddPerformance(selectedDates, time, casting);
    } else if (modalMode === "edit") {
      onEditPerformance(selectedDates[0], selectedPerformanceIndex as number, {
        time,
        casting,
      });
    }
    resetModalData();
  };

  const handleEditButton = (
    time: string,
    casting: string[],
    performanceIdx: number
  ) => {
    setModalMode("edit"); //모달의 모드를 편집 모드로 설정
    handleOpenEnrollModal(true);
    setInitCasting(casting);
    setInitTime(time);
    setSelectedPerformanceIndex(performanceIdx);
  };

  const handleDateChange = (value: Value) => {
    if (!value) {
      return;
    }
    setValue(value);
  };

  const handleToggleRangeButton = () => {
    setIsRange((prev) => !prev);
  };

  const resetModalData = () => {
    setInitCasting([]);
    setInitTime("");
    setSelectedPerformanceIndex(null);
  };

  return (
    <>
      <Calendar
        locale="ko-KR"
        formatDay={(locale, date) => `${date.getDate()}`}
        value={value}
        onChange={handleDateChange}
        selectRange={isRange}
        returnValue={isRange ? "range" : "start"}
        tileContent={({ date, view }) => {
          const formattedDate = format(new Date(date), "yyyy-MM-dd");
          return view === "month" && performances[formattedDate] ? (
            <div className="events"></div>
          ) : null;
        }}
        tileClassName={({ date }) => (date.getDay() === 6 ? "saturday" : null)}
      />
      <div className="flex">
        <ul className="flex gap-4 items-end text-xs">
          <li className="relative after:content-[''] after:bg-flesh-200 after:w-4 after:block after:absolute after:aspect-[1/1] after:top-[-20px] after:left-[50%] after:-translate-x-1/2">
            시작 날짜
          </li>
          <li className="relative after:content-[''] after:bg-flesh-500 after:w-4 after:block after:absolute after:aspect-[1/1] after:top-[-20px] after:left-[50%] after:-translate-x-1/2">
            종료 날짜
          </li>
        </ul>
        <div className="flex ml-auto items-center gap-8">
          <Button
            type="button"
            className="h-full"
            onClick={handleToggleRangeButton}
            highlight={isRange}
          >
            범위 선택
          </Button>
          <Button className="ml-auto" type="button" onClick={handleAddButton}>
            추가
          </Button>
        </div>
      </div>
      {selectedEvent && (
        <PerformanceInfo
          date={value as Date}
          performances={selectedEvent}
          onEdit={handleEditButton}
          isParentEdit={isEdit}
        />
      )}
      <Modal isOpen={showModal} onClose={() => handleOpenEnrollModal(false)}>
        <EnrollModal
          isParentEdit={isEdit}
          mode={modalMode}
          onClose={() => handleOpenEnrollModal(false)}
          onConfirm={handleConfirm}
          selectedDates={value}
          initTime={initTime}
          initCasting={initCasting}
        />
      </Modal>
    </>
  );
}
