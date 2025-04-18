"use client";
import { useState } from "react";
import { TheaterAdminUser } from "@/types/admin";
import TableRow from "./TableRow";
import TableHeader from "./TableHeader";
import TheaterAdminUserForm from "./TheaterAdminUserForm";

export default function TheaterAdminUsersTable({
  data,
}: {
  data: TheaterAdminUser[]; // 데이터 타입을 TheaterAdminUser 배열로 설정
}) {
  const headers: string[] = ["이메일", "이름", "가입날짜", "가입유형"];

  const fieldMapping: Record<(typeof headers)[number], keyof TheaterAdminUser> =
    {
      이메일: "email",
      이름: "username",
      가입날짜: "createdAt",
      가입유형: "joinType",
    };

  const [selectedAdminUser, setSelectedAdminUser] =
    useState<TheaterAdminUser | null>(null);

  const [adminUserRadioStates, setAdminUserRadioStates] = useState<
    Record<string, string> // 모든 사용자의 상태를 저장
  >({});
  const [adminUserRadioState, setAdminUserRadioState] =
    useState<string>("활성화"); // 사용자의 현재 선택된 상태를 저장하는 state 추가

  // Apply(상태변경적용 버튼)를 눌렀는지 여부를 추적
  const [applied, setApplied] = useState<boolean>(false);

  const radioOptions = [
    { value: "활성화", label: "활성화" },
    { value: "정지", label: "정지" },
    { value: "휴면", label: "휴면" },
    { value: "탈퇴", label: "탈퇴" },
  ];

  const handleAdminUserClick = (theaterAdminUser: TheaterAdminUser) => {
    setSelectedAdminUser(theaterAdminUser);
    // 해당 사용자의 상태를 userRadioStates에서 가져오거나 기본값 사용
    setAdminUserRadioState(
      adminUserRadioStates[theaterAdminUser.email] || "활성화"
    );
    // 새로운 사용자를 클릭할 때마다 applied 상태 초기화
    setApplied(false);
  };

  const handleClose = () => {
    // 모달을 닫을 때, Apply 버튼을 누르지 않았다면 임시 상태 변경을 취소
    if (!applied && selectedAdminUser) {
      // userRadioState를 원래 값으로 되돌리기 (다음에 다시 열 때를 대비)
      setAdminUserRadioState(
        adminUserRadioStates[selectedAdminUser.email] || "활성화"
      );
    }
    // applied 상태 초기화 및 선택된 사용자 초기화
    setApplied(false);
    setSelectedAdminUser(null);
  };

  const handleRadioChange = (value: string) => {
    // 라디오 버튼을 변경할 때는 임시 상태만 업데이트
    setAdminUserRadioState(value);
  };

  const handleApplyStatus = () => {
    if (selectedAdminUser) {
      // Apply 버튼을 누르면 확정된 상태 업데이트
      setAdminUserRadioStates((prevStates) => ({
        ...prevStates,
        [selectedAdminUser.email]: adminUserRadioState,
      }));

      // applied 플래그를 true로 설정
      setApplied(true);

      console.log(`상태 변경: ${adminUserRadioState}`);
      // API 연동 필요
    }
  };

  return (
    <>
      <table className="w-full table-fixed border-collapse">
        <TableHeader headers={headers} />
        <tbody>
          {data.length > 0 ? (
            data.map((theaterAdminUser, index) => (
              <TableRow
                key={index}
                rowData={theaterAdminUser}
                headers={headers}
                fieldMapping={fieldMapping}
                onClick={() => handleAdminUserClick(theaterAdminUser)} // 핸들러 적용
              />
            ))
          ) : (
            <tr>
              <td colSpan={headers.length} className="text-center py-1">
                데이터가 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* 모달: 소극장관리자 회원정보 */}
      {selectedAdminUser && (
        <TheaterAdminUserForm
          user={selectedAdminUser} // user 정보를 전달
          radioOptions={radioOptions}
          adminUserRadioState={adminUserRadioState}
          onRadioChange={handleRadioChange}
          onClose={handleClose}
          onApply={handleApplyStatus} // 상태 변경 적용
        />
      )}
    </>
  );
}
