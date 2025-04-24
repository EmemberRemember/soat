"use client";
import React, { useMemo, useState } from "react";
import SeatLayout from "../seats/SeatLayout";
import { RowConfigs } from "@/types/seat";
import { PerformanceTime } from "@/types/performance";

interface PerformanceManagerDetailProps {
  rows: number;
  totalSeats: number;
  rowsConfigs: RowConfigs;
  isAllAisle: number[];
  performanceTimes: Record<string, PerformanceTime[]>;
}
export default function PerformanceManagerDetail({
  rows,
  totalSeats,
  rowsConfigs,
  isAllAisle,
  performanceTimes,
}: PerformanceManagerDetailProps) {
  const selectOptions = useMemo(() => {
    return Object.entries(performanceTimes)
      .flatMap(([date, times]) =>
        times.map((item, idx) => ({
          label: `${date} ${item.time}`,
          value: `${date}_${idx}`,
          date,
          time: item.time,
          occupiedSeats: item.occupiedSeats,
          casting: item.casting,
        }))
      )
      .sort((a, b) => {
        const aDateTime = new Date(`${a.date}T${a.time}`);
        const bDateTime = new Date(`${b.date}T${b.time}`);
        return aDateTime.getTime() - bDateTime.getTime();
      });
  }, [performanceTimes]);

  const [selected, setSelected] = useState(selectOptions[0]);
  const selectedOccupiedSeat = selected?.occupiedSeats;
  const handleSelectChange = (value: string) => {
    const selectedOption = selectOptions.find((opt) => opt.value === value);
    if (selectedOption) {
      setSelected(selectedOption);
      // 필요하면 occupiedSeats를 상위로 전달
      //      setOccupiedSeats(selectedOption.occupiedSeats);
    }
  };
  console.log("selected", selectedOccupiedSeat);
  return (
    <>
      <select
        className="border-2 border-gray-300 focus-within:border-flesh-300 rounded-md px-2 outline-none"
        onChange={(e) => handleSelectChange(e.target.value)}
      >
        {selectOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <SeatLayout
        occupiedSeat={selectedOccupiedSeat}
        rows={rows}
        rowsConfigs={rowsConfigs}
        totalSeats={totalSeats}
        isAllAisle={isAllAisle}
      />
    </>
  );
}
