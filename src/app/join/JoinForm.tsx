import React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/controls/Button";
import { JoinInput, Checkbox } from "@/components/controls/Inputs";
import { JoinSelect } from "@/components/controls/Select";
import Link from "next/link";
import { validations } from "@/utils/validations";
import axios from "axios";
import { useSession, signOut } from "next-auth/react";
import { Plus } from "lucide-react";
import { bankCodeList } from "@/lib/bankCodeList";

const businessNumApiKey = process.env.NEXT_PUBLIC_JOIN_BUSINESS_NUM_API_KEY;

interface JoinFormProps {
  setUserType: (userType: "buyer" | "seller") => void;
  userType: "buyer" | "seller";
  setIsJoin: (isJoin: boolean) => void;
}

export default function JoinForm({
  setUserType,
  userType,
  setIsJoin,
}: JoinFormProps) {
  const [isBusiness, setIsBusiness] = useState<boolean>(false);
  const [checkAge, setCheckAge] = useState(false);
  const [checkAgree, setCheckAgree] = useState(false);
  const [checkIntermediary, setCheckIntermediary] = useState(false);
  const [email, setEmail] = useState("");
  const [isEmailValid, setIsEmailValid] = useState<boolean>(false);
  const [isSendEmail, setIsSendEmail] = useState<boolean>(false);
  const [emailSendMsg, setEmailSendMsg] = useState("");
  const [emailVerifyMsg, setEmailVerifyMsg] = useState("");
  const [verifyNum, setVerifyNum] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [userName, setUserName] = useState("");
  const [teamName, setTeamName] = useState("");
  const [managerName, setManagerName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [businessNum, setBusinessNum] = useState("");
  const [selectAccount, setSelectAccount] = useState("000");
  const [accountNum, setAccountNum] = useState("");
  const [depositor, setDepositor] = useState("");
  const [isBusinessNumValid, setIsBusinessNumValid] = useState<boolean>(false);
  const [businessNumVerifyMsg, setBusinessNumVerifyMsg] = useState("");
  const isEmailInputValid = validations.email.safeParse(email).success;
  const isBusinessNumInputValid =
    validations.businessNum.safeParse(businessNum).success;
  const isAccountNumInputValid =
    validations.accountNum.safeParse(accountNum).success;
  const [previewAccountImage, setPreviewAccountImage] = useState<string | null>(
    null
  );
  // 로그인 상태일 경우 로그아웃
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      signOut();
    }
  }, [status]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSendEmail && !isEmailValid) {
      timer = setTimeout(() => {
        setIsSendEmail(false);
      }, 60000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isSendEmail, isEmailValid]);

  function handleUserTypeChange(selectType: "buyer" | "seller") {
    setUserType(selectType);
    setEmail("");
    setIsSendEmail(false);
    setIsEmailValid(false);
    setVerifyNum("");
    setEmailSendMsg("");
    setEmailVerifyMsg("");
    setPassword("");
    setPasswordConfirm("");
    setUserPhone("");
    setCheckAgree(false);
    setCheckIntermediary(false);
    if (selectType === "seller") {
      setTeamName("");
      setManagerName("");
      setIsBusiness(false);
      setBusinessNum("");
      setSelectAccount("000");
      setAccountNum("");
      setDepositor("");
      setIsBusinessNumValid(false);
      setBusinessNumVerifyMsg("");
      setPreviewAccountImage(null);
    } else {
      setCheckAge(false);
      setUserName("");
    }
  }

  const handleAccountImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewAccountImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const formData =
    userType === "seller"
      ? {
          userType,
          email,
          password,
          teamName,
          managerName,
          phoneNumber: userPhone,
          businessNum,
          bankAccount: {
            bankCode: selectAccount,
            bankName: bankCodeList.find((bank) => bank.value === selectAccount)
              ?.label,
            depositor,
            accountNum,
            accountImage: previewAccountImage,
          },
        }
      : {
          userType,
          email,
          password,
          username: userName,
          phoneNumber: userPhone,
        };

  async function handleSendEmailVerification() {
    setEmailSendMsg("");
    try {
      const response = await axios.post("/api/auth/email-verification", {
        email,
        userType,
      });

      if (response.status === 200) {
        setIsSendEmail(true);
      }
    } catch (error) {
      console.error("이메일 인증 오류:", error);
      if (axios.isAxiosError(error)) {
        setEmailSendMsg(error.response?.data.error);
      }
    }
  }

  async function handleVerifyEmail() {
    setEmailVerifyMsg("");
    try {
      const response = await axios.put("/api/auth/email-verification/verify", {
        email,
        code: Number(verifyNum),
      });

      if (response.status === 200) {
        setIsEmailValid(true);
      }
    } catch (error) {
      console.error("이메일 인증 오류:", error);
      setEmailVerifyMsg("인증번호가 일치하지 않습니다.");
    }
  }

  async function handleBusinessNumVerification() {
    try {
      const response = await axios.post(
        "https://api.odcloud.kr/api/nts-businessman/v1/status",
        {
          b_no: [businessNum],
        },
        {
          params: {
            serviceKey: businessNumApiKey,
          },
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (response.status === 200) {
        const businessData = response.data.data[0];
        console.log("사업자등록정보 확인 결과:", response.data.data[0]);
        if (businessData.b_stt_cd !== "01") {
          throw new Error(`사업자의 상태가 ${businessData.b_stt} 입니다.`);
        } else {
          setIsBusinessNumValid(true);
          setBusinessNumVerifyMsg("사업자 번호 인증이 완료되었습니다.");
        }
      }
    } catch (error) {
      console.error("사업자등록번호 확인 오류:", error);
      setIsBusinessNumValid(false);
      setBusinessNumVerifyMsg("사업자등록번호가 유효하지 않습니다.");

      if (axios.isAxiosError(error)) {
        console.error("API 오류 메시지:", error.response?.data);
        setBusinessNumVerifyMsg("사업자 번호 인증에 오류가 발생되었습니다.");
      }
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      const response = await axios.post("/api/auth/signup", formData);

      if (response.status === 201) {
        setIsJoin(true);
      }
    } catch (error) {
      console.error("회원가입 오류:", error);
    }
  }

  return (
    <>
      <h2 className="text-xl font-bold mb-3 sm:text-3xl sm:mb-6">회원가입</h2>
      <ul className="flex justify-center w-full sm:max-w-[525px] text-xs sm:text-base sm:font-bold">
        <li className="flex-1">
          <button
            className={`w-full py-3 sm:py-5 sm:px-6 rounded-t-lg border-x border-t
            ${
              userType === "buyer"
                ? "bg-white border-gray-300 relative z-20"
                : "bg-gray-100 border-gray-200"
            }`}
            onClick={() => handleUserTypeChange("buyer")}
            type="button"
          >
            예매회원
          </button>
        </li>
        <li className="flex-1">
          <button
            className={`w-full py-3 sm:py-5 sm:px-6 rounded-t-lg border-x border-t
            ${
              userType === "seller"
                ? "bg-white border-gray-300 relative z-20"
                : "bg-gray-100 border-gray-200"
            }`}
            onClick={() => handleUserTypeChange("seller")}
            type="button"
          >
            공연 관리자
          </button>
        </li>
      </ul>
      <form
        onSubmit={handleSubmit}
        className="w-full bg-white sm:max-w-[525px] flex flex-col border rounded-xl border-gray-300 px-5 py-4 gap-[10px] sm:gap-[20px] -mt-[10px] relative sm:space-y-2"
      >
        <div className="bg-white w-1 h-4 absolute top-0 left-[49.5%] z-[100]"></div>
        <JoinInput
          label="이메일"
          type="email"
          value={email}
          onChange={setEmail}
          validation={validations.email}
          disabled={isSendEmail}
          message={
            isSendEmail
              ? "인증 번호가 이메일로 발송되었습니다. 이메일을 확인해 주세요"
              : emailSendMsg
          }
        >
          <Button
            highlight={true}
            type="button"
            onClick={(e) => {
              handleSendEmailVerification();
              (e.target as HTMLButtonElement).textContent = "재전송";
            }}
            size="small"
            className="mb-1 py-[2.5px] sm:max-w-32 sm:py-none sm:text-base sm:font-bold"
            disabled={!isEmailInputValid || isSendEmail || isEmailValid}
          >
            인증번호 받기
          </Button>
        </JoinInput>
        <JoinInput
          label="인증번호"
          value={verifyNum}
          onChange={setVerifyNum}
          disabled={!isSendEmail || isEmailValid}
          validation={validations.emailVerifyNum}
          message={
            isEmailValid ? "이메일 인증이 완료되었습니다." : emailVerifyMsg
          }
        >
          <Button
            highlight={true}
            type="button"
            onClick={handleVerifyEmail}
            size="small"
            className="mb-1 py-[2.5px] sm:max-w-16 sm:py-none sm:text-base sm:font-bold"
            disabled={isEmailValid || !verifyNum}
          >
            확인
          </Button>
        </JoinInput>
        <JoinInput
          label="비밀번호"
          value={password}
          onChange={setPassword}
          placeholder="8~24자의 영문, 숫자, 특수문자"
          validation={validations.password}
          type="password"
          max={24}
        />
        <JoinInput
          label="비밀번호 확인"
          value={passwordConfirm}
          onChange={setPasswordConfirm}
          validation={validations.passwordConfirm(password)}
          type="password"
          max={24}
        />
        {userType === "buyer" ? (
          <JoinInput
            label="이름"
            value={userName}
            onChange={setUserName}
            placeholder="10자 이내의 국문 또는 영문"
            validation={validations.name}
            max={10}
          />
        ) : (
          <>
            <JoinInput
              label="팀명"
              value={teamName}
              onChange={setTeamName}
              placeholder="10자 이내의 국문 또는 영문"
              validation={validations.teamName}
              max={10}
            />
            <JoinInput
              label="관리자명"
              value={managerName}
              onChange={setManagerName}
              placeholder="10자 이내의 국문 또는 영문"
              validation={validations.managerName}
              max={10}
            />
          </>
        )}
        <JoinInput
          label="휴대폰"
          value={userPhone}
          onChange={setUserPhone}
          placeholder="11자 숫자 (‘-’ 문자 제외)"
          validation={validations.phone}
          max={11}
        />
        {userType === "seller" && (
          <>
            <JoinSelect
              label="은행정보"
              value={selectAccount}
              onChange={setSelectAccount}
              className="mb-5"
              options={bankCodeList}
            />
            <JoinInput
              label="계좌번호"
              value={accountNum}
              onChange={setAccountNum}
              validation={validations.accountNum}
              placeholder="숫자 (‘-’ 문자 제외)"
              max={14}
            />
            <JoinInput
              label="예금주"
              value={depositor}
              onChange={setDepositor}
              placeholder="10자 이내"
              validation={validations.depositor}
              max={10}
            />
            <fieldset className="w-full relative">
              <legend className="text-sm sm:text-base">통장사본</legend>
              <label
                htmlFor="accountImage"
                className="border-2 rounded-md w-full p-2 flex justify-end cursor-pointer"
              >
                {previewAccountImage && (
                  <img
                    src={previewAccountImage}
                    alt="업로드 미리보기"
                    className="size-full object-cover rounded-md"
                  />
                )}
                <Plus
                  className={`stroke-white rounded-full bg-flesh-500 z-100 cursor-pointer hover:bg-flesh-700 transition ${
                    previewAccountImage ? "absolute" : ""
                  }`}
                  strokeWidth={3}
                />
              </label>
              <input
                className="sr-only"
                id="accountImage"
                type="file"
                accept=".jpg, .png, .gif"
                onChange={handleAccountImageChange}
              />
            </fieldset>
            <ul className="flex justify-center mb-2 gap-2">
              <li className="flex-1">
                <Button
                  type="button"
                  size="small"
                  onClick={() => setIsBusiness(false)}
                  highlight={!isBusiness}
                  className="w-full h-7 text-xs py-[6.5px] font-normal sm:h-full sm:text-base sm:py-2 sm:font-bold"
                >
                  사업자가 아닙니다
                </Button>
              </li>
              <li className="flex-1">
                <Button
                  type="button"
                  size="small"
                  onClick={() => setIsBusiness(true)}
                  highlight={isBusiness}
                  className="w-full h-7 text-xs py-[6.5px] font-normal sm:h-full sm:text-base sm:py-2 sm:font-bold"
                >
                  사업자 입니다
                </Button>
              </li>
            </ul>
            {isBusiness && (
              <>
                <JoinInput
                  label="사업자등록번호"
                  value={businessNum}
                  onChange={setBusinessNum}
                  placeholder="10자 숫자 (‘-’ 문자 제외)"
                  validation={validations.businessNum}
                  message={businessNumVerifyMsg}
                  max={10}
                />
                <Button
                  highlight={true}
                  size="small"
                  className="mb-2 py-[2.5px] sm:text-base sm:font-bold"
                  disabled={!isBusinessNumInputValid || isBusinessNumValid}
                  onClick={() => {
                    handleBusinessNumVerification();
                  }}
                  type="button"
                >
                  사업자등록번호 인증
                </Button>
              </>
            )}
          </>
        )}
        {userType === "buyer" && (
          <Checkbox checked={checkAge} onChange={setCheckAge}>
            <span className="text-xs sm:text-base">
              저는 만 14세 이상 회원 입니다.
            </span>
          </Checkbox>
        )}

        <Checkbox checked={checkAgree} onChange={setCheckAgree}>
          <span className="text-[10px] sm:text-base">
            SO@의 <Link href="/">이용 정책</Link> 및
            <Link href="/">개인정보 처리방침</Link>에 동의합니다.
          </span>
        </Checkbox>
        <Checkbox checked={checkIntermediary} onChange={setCheckIntermediary}>
          <span className="text-[10px] sm:text-base">
            {`SO@은 '통신판매중개업자'로서 통신판매의 당사자가 아님을
            확인하였습니다.`}
          </span>
        </Checkbox>
        <Button
          type="submit"
          size="full"
          disabled={
            userType === "buyer"
              ? !isSendEmail ||
                !isEmailValid ||
                !password ||
                !passwordConfirm ||
                !userName ||
                !userPhone ||
                !checkAge ||
                !checkAgree ||
                !checkIntermediary
              : !isSendEmail ||
                !isEmailValid ||
                !password ||
                !passwordConfirm ||
                !teamName ||
                !managerName ||
                !userPhone ||
                selectAccount === "000" ||
                !isAccountNumInputValid ||
                !depositor ||
                typeof previewAccountImage !== "string" ||
                (isBusiness && !isBusinessNumValid) ||
                !checkAgree ||
                !checkIntermediary
          }
          className="absolute bottom-[-54px] right-0 max-w-24 max-h-[30px] text-sm py-[19.5px] px-[7.5px] sm:text-base sm:max-w-40 sm:max-h-12 sm:bottom-[-60px]"
          highlight={true}
        >
          가입 완료
        </Button>
      </form>
    </>
  );
}
