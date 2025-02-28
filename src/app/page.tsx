import React, { Suspense } from "react";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import SlideBanner from "@/components/home/SlideBanner";
import UpcomingShowsSection from "@/components/home/UpcomingShowsSection";
import CurrentShowSection from "@/components/home/CurrentShowSection";
import Loading from "@/components/Loading";

export default function main() {
  return (
    <>
      <Header />
      <SlideBanner />
      <main className="px-[40px] md:px-[80px]">
        <Suspense fallback={<Loading />}>
          <CurrentShowSection />
        </Suspense>
        <UpcomingShowsSection />
      </main>
      <Footer />
    </>
  );
}
