"use client";
import React, { useEffect, useState } from "react";
import { PerformanceData } from "@/app/api/performance/route";
import PerformanceManagerDetail from "@/components/manager/PerformanceManagerDetail";
import axios, { isAxiosError } from "axios";
import { useParams, useRouter } from "next/navigation";
import Loading from "@/components/Loading";

export default function Page() {
  const [performanceData, setPerformanceData] = useState<PerformanceData>(
    {} as PerformanceData
  );
  const [loading, setLoading] = useState<boolean>(true);
  const params = useParams();
  const performanceId = params.performId;
  const performanceTitle = performanceData.title;
  const performanceTimes = performanceData.performances;
  const seatData = performanceData.seats;
  const router = useRouter();

  useEffect(() => {
    const getPerformance = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/performance/${performanceId}`);
        setPerformanceData(res.data.performance);
      } catch (error) {
        if (isAxiosError(error) && error.status === 404) {
          router.replace("/not-found");
        }
      } finally {
        setLoading(false);
      }
    };
    if (performanceId) {
      getPerformance();
    }
  }, []);

  if (loading) {
    return <Loading />;
  } else {
    return (
      <main className="p-10">
        <section className="m-auto w-full max-w-5xl p-4 border-2 border-gray-300 rounded-lg shadow-md bg-white flex flex-col space-y-4 overflow-auto">
          <h2 className="font-bold">{`공연명 : ${performanceTitle}`}</h2>
          {
            <PerformanceManagerDetail
              performanceId={performanceId as string}
              performanceData={performanceData}
              rows={seatData.rows}
              rowsConfigs={seatData.rowsConfigs}
              totalSeats={seatData.totalSeats}
              isAllAisle={seatData.isAllAisle}
              performanceTimes={performanceTimes}
            />
          }
        </section>
      </main>
    );
  }
}
