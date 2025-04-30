"use client";

import { useRouter } from "next/navigation";
import ButtonWithIcon from "./ButtonWithIcon";

export default function Main() {
  const router = useRouter();

  return (
    <main className="flex flex-col justify-center items-center">
      <ButtonWithIcon
        iconSrc="/images/icons/pen.svg"
        label="나의 공연 등록 및 관리"
        onClick={() => router.push("/manager/performance")}
      />
      <ButtonWithIcon
        iconSrc="/images/icons/ticket.svg"
        label="티켓 검증"
        onClick={() => router.push("/manager/ticket")}
      />
      <ButtonWithIcon
        iconSrc="/images/icons/people-black.svg"
        label="관리자 정보 수정"
        onClick={() => router.push("/manager/edit")}
      />
    </main>
  );
}
