"use client";
import { useState } from "react";
import AdminHeader from "../../../../components/admin/AdminHeader";
import AdminMain from "@/components/admin/AdminMain";
import TheaterAdminUsersTable from "@/components/admin/TheaterAdminUsersTable";
import ListTitle from "@/components/admin/ListTitle";
import QueryButton from "@/components/admin/ QueryButton";
import SubTabDescription from "@/components/admin/SubTabDescription";
import AdminSearchInput from "@/components/admin/AdminSearchInput";
import { Select } from "@/components/controls/Select";

export default function TheaterAdminUsersPage() {
  const theaterAdminData = [
    {
      email: "dnjs1111@soat.com",
      username: "김예원",
      createdAt: "2022.10.30",
      joinType: "사업자",
    },
    {
      email: "asf134@soat.com",
      username: "최예린",
      createdAt: "2025.01.20",
      joinType: "개인",
    },
    {
      email: "hyunjin88@soat.com",
      username: "현진우",
      createdAt: "2024.09.18",
      joinType: "개인",
    },
    {
      email: "yujin99@soat.com",
      username: "유진서",
      createdAt: "2023.05.07",
      joinType: "사업자",
    },
    {
      email: "seoyeon45@soat.com",
      username: "서연희",
      createdAt: "2024.08.28",
      joinType: "개인",
    },
    {
      email: "donghae78@soat.com",
      username: "동해준",
      createdAt: "2024.06.18",
      joinType: "개인",
    },
    {
      email: "jisoo_h@soat.com",
      username: "지수현",
      createdAt: "2024.03.29",
      joinType: "사업자",
    },
    {
      email: "minseok92@soat.com",
      username: "민석훈",
      createdAt: "2024.11.22",
      joinType: "개인",
    },
    {
      email: "haneulsky@soat.com",
      username: "하늘채",
      createdAt: "2024.12.25",
      joinType: "사업자",
    },
    {
      email: "kangmin23@soat.com",
      username: "강민우",
      createdAt: "2024.12.03",
      joinType: "사업자",
    },
  ];

  const [theaterAdminSelect, setTheaterAdminSelect] = useState("all");

  const filteredData =
    theaterAdminSelect === "all"
      ? theaterAdminData
      : theaterAdminData.filter((user) => user.joinType === theaterAdminSelect);

  return (
    <>
      <AdminHeader>회원관리</AdminHeader>
      <AdminMain>
        <SubTabDescription>
          소극장 관리자 회원 조회 및 상태 관리
        </SubTabDescription>
        <div className="mt-[20px] mb-4 flex flex-wrap justify-between items-center gap-4">
          <ListTitle>소극장 관리자 회원 목록</ListTitle>
          <div className="flex gap-4 items-center justify-end w-full sm:w-auto">
            <Select
              className="w-[85px] h-[35px] text-xs py-0"
              value={theaterAdminSelect}
              onChange={setTheaterAdminSelect}
              options={[
                { value: "all", label: "전체" },
                { value: "사업자", label: "사업자" },
                { value: "개인", label: "개인" },
              ]}
            />
            <form action="" className="flex gap-1">
              <AdminSearchInput
                id="theaterAdminUserSearchInput"
                name="theaterAdminUserSearch"
                label="소극장 관리자 회원 조회하기"
              />
              <QueryButton />
            </form>
          </div>
        </div>

        <TheaterAdminUsersTable data={filteredData} />
      </AdminMain>
    </>
  );
}
