"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface UserDataProps {
  label: "회원 유형" | "이름" | "이메일" | "휴대폰";
  data: string;
}

function Li({ label, data }: UserDataProps) {
  return (
    <li className="flex gap-4 mb-1">
      <p className="flex-[1] ml-8 sm:ml-0 min-w-10 sm:min-w-16 font-bold text-flesh-500 sm:text-lg">
        {label}
      </p>
      <span className="flex-[3] sm:flex-[2] sm:text-lg sm:min-w-32 whitespace-nowrap">
        {data}
      </span>
    </li>
  );
}

export default function UserInfoItem() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userInfo, setUserInfo] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    userType: "",
  });

  useEffect(() => {
    if (status !== "authenticated" && status !== "loading") {
      router.push("/login");
    }
    if (session && session.user.userType === "seller") {
      router.push("/manager");
    }

    const fetchUser = async () => {
      try {
        const response = await axios.get("/api/account/me");
        const { user } = response.data;
        setUserInfo({
          username: user.username,
          email: user.email,
          phoneNumber: user.phoneNumber,
          userType: user.userType === "seller" ? "공연 관리자" : "예매 회원",
        });
      } catch (error) {
        console.error("사용자 정보 조회 오류:", error);
      }
    };

    fetchUser();
  }, [status]);

  return (
    <ul className="p-5 rounded-[10px] w-full border-2 border-flesh-200 text-xs sm:h-80 sm:flex sm:flex-col sm:justify-center sm:gap-2 whitespace-nowrap sm:px-3 md:px-5">
      <Li label="이름" data={userInfo.username} />
      <Li label="이메일" data={userInfo.email} />
      <Li
        label="휴대폰"
        data={userInfo.phoneNumber.replace(
          /^(\d{3})(\d{4})(\d{4})$/,
          "$1-$2-$3"
        )}
      />
      <Li label="회원 유형" data={userInfo.userType} />
    </ul>
  );
}
