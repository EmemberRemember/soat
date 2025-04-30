import React from "react";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import SlideBanner from "@/components/home/SlideBanner";
import UpcomingShowsSection from "@/components/home/UpcomingShowsSection";
import CurrentShowSection from "@/components/home/CurrentShowSection";
import axios from "axios";
import { PerformanceData } from "./api/performance/route";

export const dynamic = "force-dynamic"; // 동적 렌더링 강제 설정

export default async function main() {
  const API_URL = process.env.NEXTAUTH_URL;
  const currentShows: PerformanceData[] = await (
    await axios.get(`${API_URL}/api/performance?status=booking`)
  ).data;

  const upcomingShows: PerformanceData[] = await (
    await axios.get(`${API_URL}/api/performance?status=upcoming`)
  ).data;

  return (
    <>
      <Header />
      <SlideBanner />
      <main className="px-[40px] md:px-[80px]">
        <CurrentShowSection data={currentShows} />
        <UpcomingShowsSection data={upcomingShows} />
      </main>
      <Footer />
    </>
  );
}
