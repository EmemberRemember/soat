"use client";

import NaverMapModal from "@/components/detail/NaverMap";

export default function MapDemo() {
  return (
    <div className="flex items-center justify-center h-screen">
      <NaverMapModal
        isOpen={true}
        locationName="청와대"
        locationAddress="서울특별시 종로구 청와대로 1"
        onClose={() => {}}
      />
    </div>
  );
}
