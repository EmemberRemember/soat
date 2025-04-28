// app/demo/session/page.tsx
"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/controls/Button";

export default function SessionDemo() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>로딩 중...</div>;
  }

  if (status === "authenticated") {
    return (
      <div>
        <h2>로그인 상태</h2>
        <p>이메일: {session.user.email}</p>
        <p>사용자 유형: {session.user.userType}</p>
        {session.user.userType === "seller" ? (
          <p>팀 이름: {session.user.teamName}</p>
        ) : (
          <p>사용자 이름: {session.user.username}</p>
        )}
        <Button onClick={() => signOut()}>로그아웃</Button>
        <Button onClick={() => console.log(session.user)}>디버그</Button>
      </div>
    );
  }

  return (
    <div>
      로그인되지 않은 상태입니다.
      <Button href="/login">로그인</Button>
    </div>
  );
}
