"use client";
import React, { useState, useEffect } from "react";
import { SearchInput } from "../controls/Inputs";
import Link from "next/link";
import { Menu, X, Ticket, House } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Header() {
  const [searchValue, setSearchValue] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // 회원 탈퇴 회원인경우 로그아웃 적용
    if (session?.user?.isDeleteUser) {
      signOut();
    }
  }, [session]);

  const isLoggedIn = status === "authenticated";
  const userType =
    isLoggedIn && session?.user?.userType ? session.user.userType : null;
  const isBuyer = userType === "buyer";
  const isSeller = userType === "seller";

  const handleSearch = async () => {
    const search: string = searchValue.trim();
    const category: string[] = [
      "콘서트",
      "뮤지컬",
      "연극",
      "전시/행사",
      "전시",
      "행사",
      "팬미팅",
    ];
    if (!search) {
      setSearchValue("");
      return;
    } else if (category.includes(search)) {
      router.push(`/search?category=${search}`);
    } else {
      router.push(`/search?title=${search}`);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    await signOut({ redirect: false });
    window.location.href = "/";
  };

  return (
    <header className="relative">
      {/* 메인 헤더 */}
      <div className="px-4 md:px-[140px] py-4 md:py-[40px] flex items-center justify-between">
        {/* 로고와 검색 영역 */}
        <div className="flex relative">
          <h1>
            <Link href="/">
              <img
                src="/images/icons/logo-temp.svg"
                alt="soat"
                className="w-[93px]"
                onClick={() => setSearchValue("")}
              />
            </Link>
          </h1>

          {/* 데스크톱 검색 영역 */}
          <div className="hidden md:block">
            <SearchInput
              label=""
              placeholder="검색 할 내용을 입력해주세요!"
              value={searchValue}
              onChange={setSearchValue}
              onSearch={handleSearch}
              className="w-[300px] bg-background"
              inputClassName="h-[43.47px] px-[20px]"
            />
            <img
              src="/images/icons/search-icon.svg"
              alt="검색"
              onClick={handleSearch}
              className="w-[25px] absolute right-0 top-2 cursor-pointer"
            />
          </div>
        </div>

        <ul className="hidden md:flex gap-[20px]">
          {isLoggedIn ? (
            <>
              {/* 로그인된 상태 */}
              <li className="cursor-pointer">
                <a onClick={handleLogout} className="text-black flex gap-[5px]">
                  <img
                    src="/images/icons/mypage-login-icon.svg"
                    alt="로그아웃"
                  />
                  로그아웃
                </a>
              </li>
              {isBuyer ? (
                <li className="cursor-pointer">
                  <Link href="/account" className="text-black flex gap-[5px]">
                    <House color="#fc4c13" />
                    마이페이지
                  </Link>
                </li>
              ) : isSeller ? (
                <li className="cursor-pointer">
                  <Link href="/manager" className="text-black flex gap-[5px]">
                    <Ticket color="#fc4c13" />내 공연
                  </Link>
                </li>
              ) : null}
            </>
          ) : (
            <>
              {/* 로그인되지 않은 상태 */}
              <li className="cursor-pointer">
                <Link href="/login" className="text-black flex gap-[5px]">
                  <img src="/images/icons/mypage-login-icon.svg" alt="로그인" />
                  로그인
                </Link>
              </li>
              <li className="cursor-pointer">
                <Link href="/join" className="text-black flex gap-[5px]">
                  <img src="/images/icons/join-icon.svg" alt="회원가입" />
                  회원가입
                </Link>
              </li>
            </>
          )}
        </ul>

        {/* 모바일 메뉴 버튼 */}
        <button onClick={toggleMenu} className="md:hidden p-2">
          {isMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden fixed top-[72px] left-0 w-full bg-background shadow-lg z-50">
          <div className="p-4">
            {/* 모바일 검색 */}
            <div className="relative mb-4">
              <SearchInput
                label=""
                placeholder="검색 할 내용을 입력해주세요!"
                value={searchValue}
                onChange={setSearchValue}
                onSearch={handleSearch}
                className="w-full"
                inputClassName="h-[43.47px] px-[20px] bg-background"
              />
              <img
                src="/images/icons/search-icon.svg"
                alt="검색"
                onClick={handleSearch}
                className="w-[25px] absolute right-0 top-2 cursor-pointer"
              />
            </div>

            {/* 모바일 메뉴 항목들 - 로그인 상태와 유저 타입에 따라 변경 */}
            <ul className="space-y-4">
              {isLoggedIn ? (
                <>
                  {/* 로그인된 상태 */}
                  <li className="cursor-pointer">
                    <a
                      href="#"
                      onClick={(e) => {
                        handleLogout(e);
                        toggleMenu();
                      }}
                      className="text-black flex gap-[5px] items-center p-2 hover:bg-gray-100 rounded"
                    >
                      <img
                        src="/images/icons/mypage-login-icon.svg"
                        alt="로그아웃"
                      />
                      로그아웃
                    </a>
                  </li>
                  {isBuyer ? (
                    <li className="cursor-pointer">
                      <Link
                        href="/account"
                        className="text-black flex gap-[5px] items-center p-2 hover:bg-gray-100 rounded"
                        onClick={toggleMenu}
                      >
                        <House color="#fc4c13" />
                        마이페이지
                      </Link>
                    </li>
                  ) : isSeller ? (
                    <li className="cursor-pointer">
                      <Link
                        href="/manager"
                        className="text-black flex gap-[5px] items-center p-2 hover:bg-gray-100 rounded"
                        onClick={toggleMenu}
                      >
                        <Ticket color="#fc4c13" />내 공연
                      </Link>
                    </li>
                  ) : null}
                </>
              ) : (
                <>
                  {/* 로그인되지 않은 상태 */}
                  <li className="cursor-pointer">
                    <Link
                      href="/login"
                      className="text-black flex gap-[5px] items-center p-2 hover:bg-gray-100 rounded"
                      onClick={toggleMenu}
                    >
                      <img
                        src="/images/icons/mypage-login-icon.svg"
                        alt="로그인"
                      />
                      로그인
                    </Link>
                  </li>
                  <li className="cursor-pointer">
                    <Link
                      href="/join"
                      className="text-black flex gap-[5px] items-center p-2 hover:bg-gray-100 rounded"
                      onClick={toggleMenu}
                    >
                      <img src="/images/icons/join-icon.svg" alt="회원가입" />
                      회원가입
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}
