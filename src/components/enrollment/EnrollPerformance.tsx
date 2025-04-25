"use client";

import EnrollCalendar from "@/components/enrollment/Calendar/EnrollCalendar";
import EnrollFormItems from "@/components/enrollment/EnrollFormItems";
import EnrollPoster from "@/components/enrollment/EnrollPoster";
import dynamic from "next/dynamic";
import React from "react";

const Editor = dynamic(() => import("@/components/editor/Editor"), {
  ssr: false,
});

interface EnrollPerformanceProps {
  isEdit?: boolean;
}
export default function EnrollPerformance({ isEdit = false} : EnrollPerformanceProps) {
  return (
    <main className="max-w-[1920px] m-auto mb-[140px] px-[80px]">
      <h2 className="sr-only">공연 정보 등록페이지</h2>
      <form>
        <div className="flex flex-row gap-4 flex-wrap">
          <section className="lg:w-[45.3%] w-full h-full lg:order-1">
            <h3 className="sr-only">공연 정보</h3>
            <EnrollFormItems isEdit={isEdit} />
          </section>
          <section className="lg:w-[21.6%] w-full lg:order-0">
            <h3 className="lg:sr-only">포스터</h3>
            <EnrollPoster isEdit={isEdit} />
          </section>
          <section
            id="calendar-container"
            className="lg:w-[28.125%] h-full border rounded-[10px] flex flex-col p-4 lg:order-2"
          >
            <h3 className="sr-only">공연 날짜</h3>
            <EnrollCalendar isEdit={isEdit} />
          </section>
        </div>
        <section className="w-full mt-16 min-h-[600px]">
          <h3 className="mb-4 text-base">공연 세부 정보</h3>
          <Editor isParentEdit={isEdit} />
        </section>
      </form>
    </main>
  );
}
