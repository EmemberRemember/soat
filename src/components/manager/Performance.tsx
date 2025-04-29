"use client";
import React, { useEffect, useState } from "react";
import EmblaCarousel from "./EmblaCarousel";
import { PerformanceData } from "@/app/api/performance/route";
import axios from "axios";
export interface PerformanceDataWithStatus extends PerformanceData {
  status?: string;
}

export default function Performance() {
  const [currentList, setCurrentList] = useState<PerformanceDataWithStatus[]>(
    []
  );
  const [upcomingList, setUpcomingList] = useState<PerformanceDataWithStatus[]>(
    []
  );
  const [endedList, setEndedList] = useState<PerformanceDataWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPerformanceList() {
      try {
        const response = await axios.get("/api/manager/performance");
        const nowDate = new Date();

        const getLastPerformanceDate = (performance: PerformanceData): Date => {
          const { performances, bookingEndDate } = performance;
          // 공연 일자가 등록되지 않거나 없는 경우 예매 종료일을 반환하도록 예외처리
          if (!performances || Object.keys(performances).length === 0) {
            const endDate = new Date(bookingEndDate);
            endDate.setHours(23, 59, 59, 59);
            return endDate;
          } else {
            // 실제 공연 종료일을 반환
            const lastDay = Object.keys(performances).sort(
              (a, b) => Date.parse(b) - Date.parse(a)
            )[0];
            const lastPerformances = performances[lastDay];
            const lastTime = lastPerformances
              .map(({ time }) => time)
              .sort((a, b) => Number(b) - Number(a))[0]
              .split(":");
            const lastPerformanceDate = new Date(lastDay);
            lastPerformanceDate.setHours(
              Number(lastTime[0]),
              Number(lastTime[1]),
              59,
              59
            );
            return lastPerformanceDate;
          }
        };

        setCurrentList(
          response.data.filter(
            (performance: PerformanceDataWithStatus) =>
              new Date(performance.bookingStartDate) < nowDate &&
              getLastPerformanceDate(performance) > nowDate &&
              performance.status !== "ended"
          )
        );
        setUpcomingList(
          response.data.filter(
            (performance: PerformanceDataWithStatus) =>
              new Date(performance.bookingStartDate) > nowDate
          )
        );

        setEndedList(
          response.data.filter(
            (performance: PerformanceDataWithStatus) =>
              performance.status === "ended" ||
              getLastPerformanceDate(performance) < nowDate
          )
        );
      } catch (error) {
        console.error("공연 목록 불러오기 실패:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPerformanceList();
  }, []);

  return (
    <main>
      <EmblaCarousel
        label="현재 진행중인 공연"
        data={currentList}
        isLoading={isLoading}
      />
      <EmblaCarousel
        label="오픈 예정인 공연"
        data={upcomingList}
        isLoading={isLoading}
      />
      <EmblaCarousel
        label="완료된 공연"
        data={endedList}
        isLoading={isLoading}
      />
    </main>
  );
}
