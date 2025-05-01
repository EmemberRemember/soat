"use client";
import React, { useEffect, useState } from "react";
import EmblaCarousel from "./EmblaCarousel";
import { PerformanceData } from "@/app/api/performance/route";
import getLastPerformanceDate from "@/utils/getLastPerformanceDate";
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
        const data = response.data.sort(
          (a: PerformanceDataWithStatus, b: PerformanceDataWithStatus) =>
            new Date(
              getLastPerformanceDate(a.performances) -
                getLastPerformanceDate(b.performances)
            )
        );
        setCurrentList(
          data.filter((performance: PerformanceDataWithStatus) => {
            return (
              new Date(performance.bookingStartDate) < nowDate &&
              new Date(getLastPerformanceDate(performance.performances)) >
                nowDate &&
              performance.status !== "ended"
            );
          })
        );
        setUpcomingList(
          data.filter(
            (performance: PerformanceDataWithStatus) =>
              new Date(performance.bookingStartDate) > nowDate
          )
        );

        setEndedList(
          data
            .reverse()
            .filter(
              (performance: PerformanceDataWithStatus) =>
                performance.status === "ended" ||
                new Date(getLastPerformanceDate(performance.performances)) <
                  nowDate
            )
        );
        console.log(response.data.length);
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
