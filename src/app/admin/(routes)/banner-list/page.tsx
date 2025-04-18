"use client";
import { useState } from "react";
import Image from "next/image";
import AdminHeader from "../../../../components/admin/AdminHeader";
import AdminMain from "@/components/admin/AdminMain";
import BannerListTable from "@/components/admin/BannerListTable";
import ListTitle from "@/components/admin/ListTitle";
import SubTabDescription from "@/components/admin/SubTabDescription";
import BannerDisplayOrder from "./BannerDisplayOrder";
import BannerRegister from "@/components/admin/BannerRegister";
import BannerModify from "@/components/admin/BannerModify";
import { Banner, NewBanner } from "@/types/admin";

export default function BannerListPage() {
  const [isBannerRegisterOpen, setIsBannerRegisterOpen] = useState(false); // 배너 등록 모달 상태 관리
  const [isBannerModifyOpen, setIsBannerModifyOpen] = useState(false); // 배너 수정 모달 상태 관리
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null); // 선택된 배너 정보 관리

  const [banners, setBanners] = useState([
    {
      id: 0,
      bannerTitle: "햇살극장 신규 오픈",
      registrationDate: "2025.02.10",
      bannerStatus: "활성화",
    },
    {
      id: 1,
      bannerTitle: "3월 한정 할인",
      registrationDate: "2025.02.25",
      bannerStatus: "활성화",
    },
    {
      id: 2,
      bannerTitle: "여름 페스티벌",
      registrationDate: "2025.02.01",
      bannerStatus: "활성화",
    },
    {
      id: 3,
      bannerTitle: "가을 연극제",
      registrationDate: "2025.01.20",
      bannerStatus: "비활성화",
    },
    {
      id: 4,
      bannerTitle: "크리스마스 특집",
      registrationDate: "2024.12.15",
      bannerStatus: "비활성화",
    },
  ]);

  // 모달 닫기 함수 개선
  const handleCloseRegisterModal = () => {
    setIsBannerRegisterOpen(false);
  };

  const handleCloseModifyModal = () => {
    setIsBannerModifyOpen(false);
    setSelectedBanner(null); // 선택된 배너 정보도 초기화
  };

  // 행 클릭 시 배너 수정 모달 열기
  const handleRowClick = (banner: Banner) => {
    setSelectedBanner(banner);
    setIsBannerModifyOpen(true);
  };

  // 새로운 배너 등록 핸들러
  const handleBannerRegister = (newBanner: NewBanner) => {
    // 새 배너 객체를 그대로 사용하면 bannerStatus 값이 유지됩니다.
    setBanners((prev) => [...prev, newBanner]);
    handleCloseRegisterModal(); // 등록 후 모달 닫기
  };

  // 배너 업데이트 핸들러
  const handleBannerUpdate = (updatedBanner: NewBanner) => {
    // banners 배열에서 해당 배너를 업데이트하는 로직
    setBanners((prev) =>
      prev.map((banner) =>
        banner.id === updatedBanner.id ? updatedBanner : banner
      )
    );
    handleCloseModifyModal(); // 업데이트 후 모달 닫기
  };

  return (
    <>
      <AdminHeader>컨텐츠 관리</AdminHeader>
      <AdminMain>
        <SubTabDescription>메인 배너 등록 및 관리</SubTabDescription>
        <div className="mt-[20px]">
          <ListTitle>배너 목록</ListTitle>
        </div>
        <div className="w-full flex justify-end">
          <button
            className="flex gap-1 items-center justify-end mb-1"
            onClick={() => setIsBannerRegisterOpen(true)}
          >
            <Image
              src="/images/icons/registration-btn.svg"
              alt="Registration Button"
              width={12}
              height={12}
            />
            <p className="text-xs font-medium">배너 등록하기</p>
          </button>
        </div>
        <BannerListTable data={banners} onRowClick={handleRowClick} />
        <section className="mt-10 ">
          <BannerDisplayOrder data={banners} />
        </section>
      </AdminMain>

      {isBannerRegisterOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={handleCloseRegisterModal} // 배경 클릭 시 모달 닫기
        >
          <div
            className="bg-white p-6 rounded-md w-[300px] h-[auto]"
            onClick={(e) => e.stopPropagation()} // 모달 내부 클릭 시 이벤트 전파 방지
          >
            <BannerRegister
              onClose={handleCloseRegisterModal}
              onRegister={handleBannerRegister}
            />
          </div>
        </div>
      )}

      {isBannerModifyOpen && selectedBanner && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={handleCloseModifyModal} // 배경 클릭 시 모달 닫기
        >
          <div
            className="bg-white p-6 rounded-md w-[300px] h-[auto]"
            onClick={(e) => e.stopPropagation()} // 모달 내부 클릭 시 이벤트 전파 방지
          >
            <BannerModify
              onClose={handleCloseModifyModal}
              bannerData={selectedBanner}
              onUpdate={handleBannerUpdate}
            />
          </div>
        </div>
      )}
    </>
  );
}
