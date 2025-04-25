import { PerformanceInfoProps } from "@/types/enrollment";
import React from "react";
import { CloseButton } from "../controls/Button";
import { Edit } from "lucide-react";
import { usePerformanceActions } from "@/hooks/usePerformanceActions";
export default function PerformanceInfo({
  date,
  performances,
  onEdit,
  isParentEdit
}: PerformanceInfoProps) {
  const { onDeletePerformance } = usePerformanceActions({isEdit :isParentEdit})

  const handleDel = (index: number) => {
    const removeDate = date.toString();
    onDeletePerformance(removeDate, index)
  };

  return (
    <section className="flex flex-col gap-2 max-h-[200px] overflow-auto p-2">
      <h4 className="text-sm">공연 상세 정보</h4>
      {performances.map((performance, idx) => (
        <div
          key={idx + performance.time}
          className="flex border rounded-md text-sm p-2 items-center"
        >
          <p className="flex flex-col">
            공연 시간 : {performance.time}
            {performance.casting.length !== 0 && (
              <span className="text-ellipsis break-keep">
                {`캐스팅 : ${performance.casting}`}
              </span>
            )}
          </p>

          <div className="flex gap-4 ml-auto items-center">
            <button
              className="ml-auto"
              type="button"
              onClick={() => onEdit(performance.time, performance.casting, idx)}
            >
              <Edit aria-label="수정" />
            </button>
            <CloseButton
              type="button"
              className="ml-auto"
              onClick={() => handleDel(idx)}
            />
          </div>
        </div>
      ))}
    </section>
  );
}
