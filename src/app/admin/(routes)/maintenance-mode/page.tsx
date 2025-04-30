"use client";

import { useState } from "react";
import AdminHeader from "../../../../components/admin/AdminHeader";
import AdminMain from "@/components/admin/AdminMain";
import ListTitle from "@/components/admin/ListTitle";
import SubTabDescription from "@/components/admin/SubTabDescription";
import { Checkbox, Radio } from "@/components/controls/Inputs";
import { Button } from "@/components/controls/Button";
import Modal from "@/components/Modal";
import { showToast } from "@/utils/toast";

export default function MaintenanceModePage() {
  const [modeRadio, setModeRadio] = useState("");
  const [checkedItems, setCheckedItems] = useState<Record<PageKey, boolean>>({
    home: false,
    reservation: false,
    enrollment: false,
    admin: false,
  });

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false); // 저장 확인 모달 상태 관리

  // Key 값들을 명확하게 지정
  const pageKeys = ["home", "reservation", "enrollment", "admin"] as const;
  type PageKey = (typeof pageKeys)[number]; // 'home' | 'reservation' | 'enrollment' | 'admin'

  const handleCheckboxChange = (name: PageKey) => {
    setCheckedItems((prev) => ({
      ...prev,
      [name]: !prev[name], // 현재 상태의 반대값으로 변경
    }));
  };

  // 저장하기 버튼 클릭 시 유효성 검사
  const handleSaveClick = () => {
    if (!modeRadio || Object.values(checkedItems).every((value) => !value)) {
      showToast("모든 항목을 선택해주세요.", "error"); // 경고창 표시
    } else {
      setIsApplyModalOpen(true); // 모든 값이 선택되면 저장 완료 모달 표시
    }
  };

  return (
    <>
      <AdminHeader>시스템 관리</AdminHeader>
      <AdminMain>
        <SubTabDescription>서비스 점검 모드 설정</SubTabDescription>
        <div className="mt-5">
          <ListTitle>모드 설정하기</ListTitle>
        </div>
        <div className="mt-[10px] border border-gray-300 p-4 ">
          <section className="mb-9 flex flex-col items-start">
            <h3 className="font-semibold text-sm mb-3">1. 점검 모드 설정</h3>
            <div className="text-xs pl-3">
              <Radio
                checked={modeRadio}
                onChange={setModeRadio}
                items={[
                  { value: "공사중 모드 활성화", label: "공사중 모드 활성화" },
                  {
                    value: "서비스 정상 운영 유지",
                    label: "서비스 정상 운영 유지",
                  },
                ]}
              />
            </div>
          </section>
          <section className="flex flex-col items-start">
            <h3 className="font-semibold text-sm mb-3">
              2. 적용할 페이지 선택
            </h3>
            <ul className="text-xs flex flex-col gap-2">
              {pageKeys.map((key) => (
                <li key={key} className="pl-3">
                  <Checkbox
                    checked={checkedItems[key]}
                    onChange={() => handleCheckboxChange(key)}
                  >
                    {key === "home"
                      ? "홈 (/)"
                      : key === "reservation"
                        ? "예매 (/reservation)"
                        : key === "enrollment"
                          ? "공연등록 (/enrollment)"
                          : "페이지 관리자 (/admin)"}
                  </Checkbox>
                </li>
              ))}
            </ul>
          </section>
          <div className="mt-8 flex justify-end">
            <Button onClick={handleSaveClick} highlight size="small">
              저장하기
            </Button>
          </div>
        </div>
      </AdminMain>
      {/* 저장 완료 모달 */}
      {isApplyModalOpen && (
        <Modal
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          className="flex flex-col justify-center items-center"
        >
          <div className="z-[1000] flex flex-col items-center">
            <p className="text-xs">성공적으로 저장되었습니다.</p>
            <Button
              highlight
              size="small"
              onClick={() => setIsApplyModalOpen(false)}
              className="mt-2 w-[60px]"
            >
              닫기
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
