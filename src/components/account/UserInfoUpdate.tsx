"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import { Button } from "../controls/Button";
import { JoinInput, Checkbox } from "@/components/controls/Inputs";
import Modal from "../Modal";
import { CloseButton } from "@/components/controls/Button";
import { validations } from "@/utils/validations";
import axios from "axios";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { showToast } from "@/utils/toast";

export default function UserInfoUpdate() {
  const router = useRouter();
  const [isUpdateType, setIsUpdateType] = useState<string>("password");
  const [password, setPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState<string>("");
  const [isAccountDeleteAgree, setIsAccountDeleteAgree] =
    useState<boolean>(false);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [isPasswordError, setIsPasswordError] = useState<string>("");

  const isNewPasswordValid =
    validations.password.safeParse(newPassword).success;

  useEffect(() => {
    if (!!isPasswordError && !!password) {
      setIsPasswordError("");
    }
  }, [password]);

  function handleUpdateTypeChange(type: "password" | "accountDelete") {
    setIsUpdateType(type);
    setPassword("");
    if (type === "password") {
      setNewPassword("");
      setNewPasswordConfirm("");
    }
  }

  function handleModalClose() {
    setIsOpenModal(false);
    if (isUpdateType === "accountDelete") {
      signOut({ redirect: false });
      router.push("/");
    }
  }

  async function handleUpdatePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = {
      currentPassword: password,
      newPassword: newPassword,
    };
    try {
      const response = await axios.patch("/api/account/password", formData);
      if (response.status === 200) {
        setIsOpenModal(true);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          setIsPasswordError("현재 비밀번호가 일치하지 않습니다.");
        } else {
          showToast("비밀번호 변경에 실패했습니다.", "error");
        }
      }
    }
  }

  async function handleUserDelete(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = {
      currentPassword: password,
    };
    try {
      const response = await axios.post("/api/account/delete", formData);

      if (response.status === 200) {
        setIsOpenModal(true);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          setIsPasswordError("현재 비밀번호가 일치하지 않습니다.");
        } else {
          showToast("회원 탈퇴에 실패했습니다.", "error");
        }
      }
    }
  }

  return (
    <>
      <h2 className="text-xl font-bold mb-3 sm:text-3xl sm:mb-6">
        회원 정보 수정
      </h2>
      <ul className="flex justify-center w-full sm:max-w-[525px] text-xs sm:text-base sm:font-bold">
        <li className="flex-1">
          <button
            className={`w-full py-3 sm:py-5 sm:px-6 rounded-t-lg border-x border-t 
            ${
              isUpdateType === "password"
                ? "bg-white border-gray-300 relative z-20"
                : "bg-gray-100 border-gray-200"
            }`}
            onClick={() => handleUpdateTypeChange("password")}
            type="button"
          >
            비밀번호 변경
          </button>
        </li>
        <li className="flex-1">
          <button
            className={`w-full py-3 sm:py-5 sm:px-6 rounded-t-lg border-x border-t
            ${
              isUpdateType === "accountDelete"
                ? "bg-white border-gray-300 relative z-20"
                : "bg-gray-100 border-gray-200 "
            }`}
            onClick={() => handleUpdateTypeChange("accountDelete")}
            type="button"
          >
            회원 탈퇴
          </button>
        </li>
      </ul>
      <form
        className="w-full bg-white sm:max-w-[525px] flex flex-col border rounded-xl border-gray-300 px-5 py-[30px] gap-[10px] relative sm:gap-5 -mt-[10px]"
        onSubmit={
          isUpdateType === "password" ? handleUpdatePassword : handleUserDelete
        }
      >
        <div className="bg-white w-1 h-4 absolute top-0 left-[49.5%] z-[100]"></div>
        <JoinInput
          label="현재 비밀번호"
          type="password"
          value={password}
          onChange={setPassword}
          message={isPasswordError}
        />
        {isUpdateType === "password" ? (
          <>
            <JoinInput
              label="새 비밀번호"
              type="password"
              value={newPassword}
              onChange={setNewPassword}
              placeholder="8~24자의 영문, 숫자, 특수문자"
              validation={validations.password}
            />
            <JoinInput
              label="비밀번호 확인"
              type="password"
              value={newPasswordConfirm}
              onChange={setNewPasswordConfirm}
              validation={validations.passwordConfirm(newPassword)}
            />
            <Button
              type="submit"
              highlight
              className="absolute bottom-[-50px] right-0 px-[14px] py-[7.5px] text-xs sm:text-base sm:max-w-40 sm:max-h-12 sm:bottom-[-60px]"
              disabled={
                !password ||
                !isNewPasswordValid ||
                newPassword !== newPasswordConfirm
              }
            >
              비밀번호 변경하기
            </Button>
          </>
        ) : (
          <>
            <h3 className="sm:text-lg sm:font-bold">[회원 탈퇴 안내]</h3>
            <p className="text-xs sm:text-base">
              그동안 <span className="text-flesh-500">SO@</span>을 이용해 주셔서
              감사합니다.
            </p>
            <p className="text-xs sm:text-base">
              회원 탈퇴 시 아래 내용이 적용 됩니다.
            </p>
            <ol className="list-decimal px-[14px] text-xs flex flex-col gap-1 sm:text-base">
              <li>
                예매 내역 및 공연 기록이 삭제되지 않으며, 환불이 필요한 경우
                기존 정책에 따라 처리됩니다.
              </li>
              <li>
                보유 중인 할인 쿠폰 및 포인트는 모두 소멸되며 복구가 불가능
                합니다.
              </li>
              <li>
                탈퇴 후에는 공연 관리자와의 소통 내역을 조회할 수 없습니다.
              </li>
            </ol>
            <Checkbox
              checked={isAccountDeleteAgree}
              onChange={setIsAccountDeleteAgree}
              className="text-xs sm:text-base"
            >
              <span>위 내용을 확인하였으며, 회원 탈퇴에 동의합니다.</span>
            </Checkbox>
            <Button
              type="submit"
              highlight
              className="absolute bottom-[-50px] right-0 px-[14px] py-[7.5px] text-xs sm:text-base sm:max-w-40 sm:max-h-12 sm:bottom-[-60px]"
              disabled={!password || !isAccountDeleteAgree}
            >
              회원 탈퇴 하기
            </Button>
          </>
        )}
      </form>

      <Modal
        isOpen={isOpenModal}
        onClose={() => handleModalClose()}
        className="max-w-[300px] flex flex-col justify-center items-center relative h-[210px] gap-5"
      >
        <>
          <CloseButton
            onClick={() => handleModalClose()}
            className="absolute top-4 right-4"
          />
          <p className="text-base">
            {isUpdateType === "password"
              ? "비밀번호 변경이 완료되었습니다."
              : "회원 탈퇴가 완료되었습니다."}
          </p>
          <Button
            highlight
            onClick={() => handleModalClose()}
            size="full"
            className="max-w-20 flex justify-center text-xs font-normal px-[28.5px] py-[7.5px]"
          >
            확인
          </Button>
        </>
      </Modal>
    </>
  );
}
