"use client";
import { useState } from "react";
import { TheaterAdminUser } from "@/types/admin";
import { CloseButton, Button } from "../controls/Button";
import { Radio } from "../controls/Inputs";
import JoinTypeModal from "./JoinTypeModal";
import Modal from "../Modal";

export default function TheaterAdminUserForm({
  user,
  radioOptions,
  adminUserRadioState,
  onRadioChange,
  onClose,
  onApply,
}: {
  user: TheaterAdminUser;
  radioOptions: { value: string; label: string }[];
  adminUserRadioState: string;
  onRadioChange: (value: string) => void;
  onClose: () => void;
  onApply: () => void;
}) {
  const [isOpenJoinTypeModal, setIsOpenJoinTypeModal] = useState(false); // 가입유형 모달 상태 관리
  const [isModalOpen, setIsModalOpen] = useState(false); //변경여부 모달 상태 관리
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false); //변경사항 저장 확인 모달 상태 관리

  const handleButtonClick = () => {
    if (adminUserRadioState) {
      setIsOpenJoinTypeModal(true);
    } else {
      alert("라디오 버튼을 선택하세요.");
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 flex justify-center items-center bg-black/50 ${
          user ? "block" : "hidden"
        } z-50`}
      >
        <div className="w-[330px] h-[80%] max-h-[560px] p-4 bg-white rounded-md z-60">
          <div className="relative flex justify-center w-full">
            <h2 className="font-semibold text-center">
              <span>{user.username}</span>님의 회원정보
            </h2>
            <CloseButton onClick={onClose} className="absolute right-0" />
          </div>
          <section className="mt-4 text-xs">
            <h3 className="sr-only">회원정보</h3>
            <dl className="flex flex-wrap gap-x-1 gap-y-1">
              {[
                { label: "이름", value: user.username },
                { label: "이메일", value: user.email },
                { label: "휴대폰번호", value: "-" },
                { label: "회원유형", value: "-" },
                { label: "가입날짜", value: user.createdAt },
                { label: "가입유형", value: user.joinType, withButton: true },
                { label: "사업자등록번호", value: "-" },
                { label: "팀명", value: "-" },
              ].map(({ label, value }, index) => (
                <div className="flex w-full items-center" key={index}>
                  <dt className="mr-2 w-[80px]">{label}</dt>
                  <dd className="flex items-center">
                    {value}
                    {label === "가입유형" && (
                      <Button
                        className="ml-2 h-[20px] text-xs flex items-center"
                        size="small"
                        onClick={handleButtonClick}
                      >
                        변경
                      </Button>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          {/* 보유 공연 목록 섹션 추가 */}
          <section className="mt-5">
            <h3 className="font-semibold text-sm py-2 border-t border-t-gray-300">
              보유 공연 목록
            </h3>
            <div className="h-[70px] flex justify-center items-center">
              <p className="text-xs text-gray-500">
                보유 공연 목록이 없습니다.
              </p>
            </div>
          </section>

          <section className="mt-5">
            <h3 className="font-semibold text-sm py-2 border-t border-t-gray-300">
              계정 상태
            </h3>
            <Radio
              className="text-xs mt-1"
              checked={adminUserRadioState}
              onChange={onRadioChange}
              items={radioOptions}
            />
            <p className="text-xs text-gray-500 font-light mt-2 mb-4">
              (현재 상태 : <span>{adminUserRadioState}</span>)
            </p>
            <Button
              highlight
              size="small"
              onClick={() => {
                setIsModalOpen(true); // 모달 열기
              }}
            >
              상태 변경 적용
            </Button>
          </section>
        </div>
      </div>
      {/* 가입유형 변경 여부 모달 */}
      {isOpenJoinTypeModal && (
        <JoinTypeModal
          onClose={() => {
            setIsOpenJoinTypeModal(false);
            setIsApplyModalOpen(true); // 변경 완료 모달 열기
          }}
        />
      )}

      {/* 계정 상태 변경 여부 모달 */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          className=" flex flex-col justify-center items-center"
        >
          <div className="z-[1000]">
            <p className="text-xs">계정 상태를 변경하시겠습니까?</p>
            <div className="flex justify-center gap-2">
              <Button
                size="small"
                onClick={() => setIsModalOpen(false)}
                className="mt-2 w-[60px]"
              >
                아니오
              </Button>
              <Button
                highlight
                size="small"
                onClick={() => {
                  setIsApplyModalOpen(true);
                  setIsModalOpen(false);
                  onApply(); // 상태 변경 함수 실행
                }}
                className="mt-2 w-[60px]"
              >
                예
              </Button>
            </div>
          </div>
        </Modal>
      )}
      {/* 변경 완료 모달 */}
      {isApplyModalOpen && (
        <Modal
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          className=" flex flex-col justify-center items-center"
        >
          <div className="z-[1000] flex flex-col items-center">
            <p className="text-xs">성공적으로 변경되었습니다.</p>
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
