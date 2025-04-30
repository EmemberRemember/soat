"use client";
import React, { useMemo, useState } from "react";
import SeatLayout from "../seats/SeatLayout";
import { RowConfigs } from "@/types/seat";
import { PerformanceTime } from "@/types/performance";
import { PerformanceData } from "@/app/api/performance/route";
import { Button } from "../controls/Button";
import axios from "axios";
import { showToast } from "@/utils/toast";
import { useRouter } from "next/navigation";

interface PerformanceManagerDetailProps {
  rows: number;
  totalSeats: number;
  rowsConfigs: RowConfigs;
  isAllAisle: number[];
  performanceTimes: Record<string, PerformanceTime[]>;
  performanceData: PerformanceData;
  performanceId: string;
}

interface SelectedPerformanceTime extends PerformanceTime {
  label: string;
  value: string;
  date: string;
}

export default function PerformanceManagerDetail({
  rows,
  totalSeats,
  rowsConfigs,
  isAllAisle,
  performanceTimes,
  performanceData,
  performanceId,
}: PerformanceManagerDetailProps) {
  const selectOptions = useMemo(() => {
    return Object.entries(performanceTimes)
      .flatMap(([date, times]) =>
        times.map((item, idx) => ({
          label: `${date} ${item.time}`,
          value: `${date}_${idx}`,
          date,
          time: item.time,
          occupiedSeats: item?.occupiedSeats,
          casting: item.casting,
          status: item.status,
        }))
      )
      .sort((a, b) => {
        const aDateTime = new Date(`${a.date}T${a.time}`);
        const bDateTime = new Date(`${b.date}T${b.time}`);
        return aDateTime.getTime() - bDateTime.getTime();
      });
  }, [performanceTimes]);

  const [selected, setSelected] = useState<SelectedPerformanceTime>(
    selectOptions[0]
  );
  const selectedOccupiedSeat = selected?.occupiedSeats;

  const handleSelectChange = (value: string) => {
    const selectedOption = selectOptions.find((opt) => opt.value === value);
    if (selectedOption) {
      setSelected(selectedOption);
    }
  };

  const router = useRouter();

  const handleEndPerformance = async () => {
    try {
      const response = await axios.post(
        `/api/manager/performance/${performanceId}/end`,
        {
          date: selected.date,
          time: selected.time,
        }
      );
      if (response.status === 200) {
        showToast(
          "공연이 취소되었습니다. 관리자 페이지로 이동합니다.",
          "success",
          () => {
            router.push("/manager/performance");
          }
        );
      }
    } catch (error) {
      showToast("공연 취소 중 오류가 발생했습니다", "error");
      console.error("공연 취소 오류:", error);
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <select
          className="w-full border-2 border-gray-300 focus-within:border-flesh-300 rounded-md px-2 outline-none"
          onChange={(e) => handleSelectChange(e.target.value)}
        >
          {selectOptions.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              className={`${opt.status === "ended" && "text-gray-400"}`}
            >
              {opt.label}
            </option>
          ))}
        </select>

        <Button
          onClick={handleEndPerformance}
          size="small"
          className="whitespace-nowrap"
          disabled={selected.status === "ended"}
        >
          공연 취소
        </Button>
      </div>
      {selected.status === "ended" && (
        <span className="text-flesh-500 text-sm w-full text-center mt-2">
          해당 공연은 종료된 공연입니다.
        </span>
      )}
      <SeatLayout
        performanceData={performanceData}
        occupiedSeat={selectedOccupiedSeat}
        rows={rows}
        rowsConfigs={rowsConfigs}
        totalSeats={totalSeats}
        isAllAisle={isAllAisle}
        performanceTime={selected.time}
        performanceDate={selected.date}
      />
    </>
  );
}
