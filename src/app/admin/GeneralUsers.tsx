import AdminHeader from "../../components/admin/AdminHeader";
import AdminMain from "@/components/admin/AdminMain";
import GeneralUsersTable from "@/components/admin/GeneralUsersTable";
import ListTitle from "@/components/admin/ListTitle";
import QueryButton from "@/components/admin/ QueryButton";
import SubTabDescription from "@/components/admin/SubTabDescription";
import AdminSearchInput from "@/components/admin/AdminSearchInput";
import { GeneralUser } from "@/types/admin";

export default async function GeneralUsers() {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users`
  );
  const generalUserData = (await response.json()) as GeneralUser[];

  return (
    <>
      <AdminHeader>회원관리</AdminHeader>
      <AdminMain>
        <SubTabDescription>일반회원 조회 및 상태 관리</SubTabDescription>
        <div className="mt-[20px] mb-4 flex justify-between items-center">
          <ListTitle>일반회원 목록</ListTitle>
          <form action="">
            <AdminSearchInput
              id="generalUserSearchInput"
              name="generalUserSearch"
              label="일반회원 조회하기"
            />
            <QueryButton />
          </form>
        </div>
        <GeneralUsersTable data={generalUserData} />
      </AdminMain>
    </>
  );
}
