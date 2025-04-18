"use client";
import { useState } from "react";

import JoinGreeting from "./JoinGreeting";
import JoinForm from "./JoinForm";
import Header from "@/components/Header";

export default function Page() {
  const [userType, setUserType] = useState<"buyer" | "seller">("buyer");
  const [isJoin, setIsJoin] = useState<boolean>(false); // 회원가입 완료 시 회원가입완료 컴포넌트를 보여줍니다.

  return (
    <>
      <Header />
      <main
        className={`m-auto w-full flex flex-col items-center px-[30px] py-6 h-[calc(100vh-76px)] sm:h-[calc(100vh-147.5px)] relative ${
          isJoin && "justify-center text-center max-w-none"
        } `}
      >
        {!isJoin && (
          <JoinForm
            setUserType={setUserType}
            userType={userType}
            setIsJoin={setIsJoin}
          />
        )}
        {isJoin && <JoinGreeting userType={userType} />}
      </main>
    </>
  );
}
