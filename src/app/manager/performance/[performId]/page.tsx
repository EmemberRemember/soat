import PerformanceManagerDetail from "@/components/manager/PerformanceManagerDetail";
import axios from "axios";
import React from "react";
interface myPerformanceProps {
  params: { performId: string };
}

export default async function page({ params }: myPerformanceProps) {
  const API_URL = process.env.NEXTAUTH_URL;
  const res = await axios.get(`${API_URL}/api/performance/${params.performId}`);
  const performanceData = res.data.performance;
  const performanceTitle = performanceData.title;
  const performanceTimes = performanceData.performances;
  const seatData = performanceData.seats;

  return (
    <main className="p-10">
      <section className="m-auto w-full max-w-5xl p-4 border-2 border-gray-300 rounded-lg shadow-md bg-white flex flex-col space-y-4">
        <h2 className="font-bold">{performanceTitle}</h2>
        <PerformanceManagerDetail
          performanceTimes={performanceTimes}
          rows={seatData.rows}
          rowsConfigs={seatData.rowsConfigs}
          totalSeats={seatData.totalSeat}
          isAllAisle={seatData.isAllAisle}
        />
      </section>
    </main>
  );
}
