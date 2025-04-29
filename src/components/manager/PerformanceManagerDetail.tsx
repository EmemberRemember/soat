"use client";
import React, { useMemo, useState } from "react";
import SeatLayout from "../seats/SeatLayout";
import { RowConfigs } from "@/types/seat";
import { PerformanceTime } from "@/types/performance";
import { PerformanceData } from "@/app/api/performance/route";
import { Button } from "../controls/Button";

interface PerformanceManagerDetailProps {
  rows: number;
  totalSeats: number;
  rowsConfigs: RowConfigs;
  isAllAisle: number[];
  performanceTimes: Record<string, PerformanceTime[]>;
  performanceData: PerformanceData;
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

  console.log(selected, "selected");

  const handleCancelPerformance = () => {
    console.log("공연 취소", selected);
  };
  return (
    <>
      <div className="flex gap-2">
        <select
          className="w-full border-2 border-gray-300 focus-within:border-flesh-300 rounded-md px-2 outline-none"
          onChange={(e) => handleSelectChange(e.target.value)}
        >
          {selectOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <Button
          onClick={handleCancelPerformance}
          size="small"
          className="whitespace-nowrap"
        >
          공연 취소
        </Button>
      </div>
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
