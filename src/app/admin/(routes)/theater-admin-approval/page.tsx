export const dynamic = "force-dynamic"; // 동적 렌더링 강제 설정

import AdminHeader from "../../../../components/admin/AdminHeader";
import AdminMain from "@/components/admin/AdminMain";
import TheaterAdminApprovalTable from "@/components/admin/TheaterAdminApprovalTable";
import ListTitle from "@/components/admin/ListTitle";
import SubTabDescription from "@/components/admin/SubTabDescription";
import { NewTheaterAdmin } from "@/types/admin";

export default async function TheaterAdminApprovalPage() {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/theater/approval`
  );
  const newTheaterAdminData = (await response.json()) as NewTheaterAdmin[];

  return (
    <>
      <AdminHeader>회원관리</AdminHeader>
      <AdminMain>
        <SubTabDescription>신규 소극장 관리자 승인</SubTabDescription>
        <div className="mt-[20px] mb-4 flex justify-between items-center">
          <ListTitle>대기 중인 소극장 관리자 신청 목록</ListTitle>
        </div>
        {newTheaterAdminData.length === 0 && (
          <div className="text-center py-1">데이터가 없습니다.</div>
        )}
        {newTheaterAdminData.length > 0 && (
          <TheaterAdminApprovalTable data={newTheaterAdminData} />
        )}
      </AdminMain>
    </>
  );
}
