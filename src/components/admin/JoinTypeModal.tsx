"use client";
import { useState } from "react";
import { Button, CloseButton } from "../controls/Button";
import { Radio } from "../controls/Inputs";
import { showToast } from "@/utils/toast";

export default function JoinTypeModal({ onClose }: { onClose: () => void }) {
  const [joinTypeRadio, setJoinTypeRadio] = useState("individual");
  const [businessNumber, setBusinessNumber] = useState("");

  const handleClose = () => {
    onClose(); // 부모 컴포넌트에서 전달된 close 함수 호출
  };

  const handleApplyJoinType = () => {
    if (joinTypeRadio === "entrepreneur" && !businessNumber) {
      showToast("사업자등록번호를 입력해주세요.", "error");
      return; // 사업자 등록번호가 없으면 처리되지 않음
    }

    if (joinTypeRadio === "individual") {
      showToast("예매 회원으로 변경되었습니다.", "success");
    } else if (joinTypeRadio === "entrepreneur") {
      showToast(
        `사업자 회원으로 변경되었습니다. (사업자번호: ${businessNumber})`,
        "success"
      );
    }
    handleClose(); // 변경이 완료되면 모달을 닫음
  };

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="w-[250px] h-[auto] max-h-[200px] bg-white p-4 rounded-lg">
        <div className="flex justify-between">
          <h2 className="text-md font-semibold mb-3">가입유형</h2>
          <CloseButton onClick={handleClose} />
        </div>
        <Radio
          className="text-xs"
          checked={joinTypeRadio}
          onChange={setJoinTypeRadio}
          items={[
            { value: "individual", label: "개인" },
            { value: "entrepreneur", label: "사업자" },
          ]}
        />
        {joinTypeRadio === "entrepreneur" && (
          <>
            <p className="text-xs font-medium mt-4 mb-1">사업자등록번호</p>
            <input
              type="text"
              value={businessNumber}
              onChange={(e) => {
                const inputValue = e.target.value;
                if (!/^\d*$/.test(inputValue)) {
                  showToast("숫자만 입력해주세요.", "error");
                  return;
                }
                setBusinessNumber(inputValue);
              }}
              className="w-[180px] h-[22px] border border-gray-500 text-xs focus-visible:outline-none rounded-sm p-1 mr-1"
            />
          </>
        )}
        <Button
          highlight
          size="small"
          className="mt-4"
          onClick={handleApplyJoinType}
        >
          변경하기
        </Button>
      </div>
    </div>
  );
}
