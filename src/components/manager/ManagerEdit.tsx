"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { JoinInput } from "@/components/controls/Inputs";
import { Button } from "../controls/Button";
import axios from "axios";
import { validations } from "@/utils/validations";
import { showToast } from "@/utils/toast";

type EmailUpdateState =
  | "initial"
  | "emailSent"
  | "checkVerifyNum"
  | "success"
  | "error";

export default function ManagerEdit() {
  const [teamName, setTeamName] = useState<string>("");
  const [businessNum, setBusinessNum] = useState<string>("");
  const [managerName, setManagerName] = useState("");
  const [email, setEmail] = useState<string>("");
  const [verifyNum, setVerifyNum] = useState<string>("");
  const [originalData, setOriginalData] = useState({
    teamName,
    managerName,
    email,
  });
  const [isEditBtnDisabled, setIsEditBtnDisabled] = useState(true);
  const [wantToChangeEmail, setWantToChangeEmail] = useState(false);
  const [emailUpdate, setEmailUpdate] = useState<EmailUpdateState>("initial");
  const [emailError, setEmailError] = useState<string>("");
  const [verifyNumError, setVerifyNumError] = useState<string>("");
  const [emailBtnLabel, setEmailBtnLabel] =
    useState<string>("이메일(아이디) 변경하기");
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("/api/account/me");
        const { user } = response.data;
        const businessNumData: string = user.businessNum;
        setTeamName(user.teamName);
        if (businessNumData) {
          setBusinessNum(
            businessNumData.replace(/(\d{3})(\d{2})(\d{5})/, "$1-$2-$3")
          );
        } else {
          setBusinessNum("사업자가 아닙니다.");
        }
        setManagerName(user.managerName);
        setEmail(user.email);
        setOriginalData({
          teamName: user.teamName,
          managerName: user.managerName,
          email: user.email,
        });
      } catch (error) {
        console.error("사용자 정보 조회 오류:", error);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const isChanged =
      teamName !== originalData.teamName ||
      managerName !== originalData.managerName;
    const isValid =
      validations.teamName.safeParse(teamName).success &&
      validations.managerName.safeParse(managerName).success;

    if (emailUpdate !== "success") {
      setIsEditBtnDisabled(!(isChanged && isValid));
    } else {
      setIsEditBtnDisabled(emailUpdate !== "success");
    }
  }, [teamName, managerName, emailUpdate]);

  useEffect(() => {
    if (emailUpdate === "error") {
      setEmailError("");
      setVerifyNumError("");
    }
  }, [email, verifyNum]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const formData =
        emailUpdate === "success"
          ? { teamName, managerName, email }
          : { teamName, managerName };

      const response = await axios.patch("/api/manager/edit", formData);
      showToast("정보 수정이 완료되었습니다.", "success", () => {
        router.push("/manager");
      });
    } catch (error) {
      showToast("정보 수정 중 오류가 발생했습니다.", "error");
      console.error("수정 오류:", error);
    }
  }

  async function handleEmailChange() {
    if (emailBtnLabel === "이메일(아이디) 변경하기") {
      setWantToChangeEmail(true);
      setEmail("");
      setEmailBtnLabel("인증번호 전송");
    } else if (emailBtnLabel.includes("인증번호")) {
      if (!email || email.trim() === "") {
        showToast("이메일이 입력되지 않았습니다.", "error");
        return;
      }
      // 이메일 인증 api 호출
      try {
        const response = await axios.post("/api/auth/email-verification", {
          email,
          userType: "seller",
        });
        console.log("인증번호 전송 성공:", response.data);
        showToast("이메일 인증번호가 전송되었습니다.", "success");
        setEmailUpdate("emailSent");
      } catch (error) {
        console.error("인증번호 전송 오류:", error);
        showToast("이메일 인증번호 전송에 실패했습니다.", "error");
        setEmailUpdate("error");
        if (axios.isAxiosError(error)) {
          setEmailError(error.response?.data.error);
        }
      }
    }
  }

  async function handleCheckVerifyNum() {
    setEmailUpdate("checkVerifyNum");
    try {
      const response = await axios.put("/api/auth/email-verification/verify", {
        email,
        code: Number(verifyNum),
      });
      console.log("인증번호 확인 성공:", response.data);
      setEmailUpdate("success");
    } catch (error) {
      console.error("인증번호 확인 오류:", error);
      setEmailUpdate("error");
      setVerifyNumError("인증번호가 일치하지 않습니다.");
    }
  }

  return (
    <main className="px-6 sm:px-0">
      <form
        className="m-auto mt-5 w-full max-w-lg bg-white p-6 space-y-5 sm:space-y-10 rounded-lg border shadow-md relative"
        onSubmit={handleSubmit}
      >
        <JoinInput
          label="팀명"
          value={teamName}
          onChange={setTeamName}
          vertical
          validation={validations.teamName}
          placeholder="10자 이내의 국문 또는 영문"
          max={10}
        />
        <JoinInput
          label="관리자명"
          value={managerName}
          onChange={setManagerName}
          placeholder="10자 이내의 국문 또는 영문"
          validation={validations.managerName}
          max={10}
          vertical
        />
        <JoinInput
          label="이메일"
          value={email}
          onChange={setEmail}
          disabled={
            !wantToChangeEmail ||
            emailUpdate === "emailSent" ||
            emailUpdate === "success"
          }
          placeholder="이메일을 입력해주세요."
          validation={validations.email}
          message={emailError}
          vertical
        >
          <Button
            size="small"
            type="button"
            highlight
            className="absolute right-6  font-normal sm:font-bold"
            disabled={emailUpdate === "emailSent" || emailUpdate === "success"}
            onClick={() => handleEmailChange()}
          >
            {emailBtnLabel}
          </Button>
        </JoinInput>
        {wantToChangeEmail && (
          <JoinInput
            label="인증번호"
            value={verifyNum}
            onChange={setVerifyNum}
            disabled={emailUpdate !== "emailSent"}
            placeholder="인증번호를 입력해주세요."
            validation={validations.emailVerifyNum}
            message={verifyNumError}
            vertical
          >
            <Button
              size="small"
              type="button"
              highlight
              className="absolute right-6 font-normal sm:font-bold"
              disabled={emailUpdate !== "emailSent"}
              onClick={() => handleCheckVerifyNum()}
            >
              확인
            </Button>
          </JoinInput>
        )}

        <JoinInput
          label="사업자등록번호"
          value={businessNum}
          onChange={setBusinessNum}
          disabled
          vertical
        />

        <p className="text-sm sm:text-base text-gray-500">
          * 사업자등록번호는 변경이 불가합니다.
        </p>
        <ul className="mt-7 flex justify-end gap-2">
          <li>
            <Button
              size="full"
              className="max-w-24 max-h-[30px] text-sm px-[7.5px] sm:text-base sm:max-w-40 sm:max-h-12 font-normal sm:font-bold"
              type="button"
              onClick={() => router.back()}
            >
              뒤로가기
            </Button>
          </li>
          <li>
            <Button
              size="full"
              className="max-w-24 max-h-[30px] text-sm px-[7.5px] sm:text-base sm:max-w-40 sm:max-h-12 font-normal sm:font-bold"
              type="submit"
              highlight
              disabled={isEditBtnDisabled}
            >
              수정완료
            </Button>
          </li>
        </ul>
      </form>
    </main>
  );
}
