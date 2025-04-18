import React from "react";
import EmblaCarousel from "./EmblaCarousel";

export default function Performance() {
  return (
    <main>
      <EmblaCarousel label="현재 진행중인 공연" />
      <EmblaCarousel label="오픈 예정인 공연" />
      <EmblaCarousel label="완료된 공연" />
    </main>
  );
}
