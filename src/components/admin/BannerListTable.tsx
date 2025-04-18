import TableHeader from "./TableHeader";
import { Banner } from "@/types/admin";

export default function BannerListTable({
  data,
  onRowClick, // onRowClick props 추가
}: {
  data: Banner[];
  onRowClick: (banner: Banner) => void; // 행 클릭 시 호출될 함수
}) {
  const headers = ["배너제목", "등록일", "상태"]; // 테이블 헤더명 선언

  // const fieldMapping: {
  //   [key in (typeof headers)[number]]: keyof Banner;
  // } = {
  //   배너제목: "bannerTitle", // 한글 헤더와 실제 데이터 필드명 매핑
  //   등록일: "registrationDate",
  //   상태: "bannerStatus",
  // };

  return (
    <table className="w-full table-fixed border-collapse">
      <TableHeader headers={headers} />
      <tbody>
        {data.length > 0 ? (
          data.map((banner, index) => (
            <tr
              key={index}
              onClick={() => onRowClick(banner)} // 클릭 시 배너 데이터를 onRowClick에 전달
              className="cursor-pointer  hover:bg-gray-100"
            >
              <td className="text-xs text-center py-1 border-t border-gray-300">
                {banner.bannerTitle}
              </td>
              <td className="text-xs text-center py-1 border-t border-gray-300">
                {banner.registrationDate}
              </td>
              <td className="text-xs text-center py-1 border-t border-gray-300">
                {banner.bannerStatus}
              </td>
            </tr>
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
  );
}
