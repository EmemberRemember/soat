"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status !== "authenticated" && status !== "loading") {
      router.push("/login");
    }
    if (session && session.user.userType !== "seller") {
      router.push("/account");
    }
  }, [status]);

  const pageTitleMap: Record<string, string | null> = {
    "/manager": null,
    "/manager/performance": "나의 공연 등록 및 관리",
    "/manager/ticket": "티켓 검증",
    "/manager/edit": "관리자 정보 수정",
  };

  const subtitle = pageTitleMap[pathname] || null;

  return (
    <header className="flex justify-between items-center p-3 h-16">
      <h1>
        <Link href="/">
          <img src="/images/icons/logo-temp.svg" alt="쏘앳" />
        </Link>
      </h1>
      <div className="flex flex-col items-center">
        <h2>
          <Link href="/manager" className="text-inherit">
            관리자페이지
          </Link>
        </h2>
        {subtitle && <h3 className="text-sm">{subtitle}</h3>}
      </div>
      <button className="flex" onClick={() => signOut({ callbackUrl: "/" })}>
        <img src="/images/icons/people.svg" className="mr-1" />
        로그아웃
      </button>
    </header>
  );
}
