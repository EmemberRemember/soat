import { Card, CardContent } from "@/components/ui/card";
import { Pencil, Eye, Trash, CalendarX } from "lucide-react";
import { PerformanceButton } from "./PerformanceButton";
interface PerformanceMoreBtnProps {
  label?: string;
  onClickEditBtn?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onClickCheckBtn?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onClickTerminateBtn?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onClickDeleteBtn?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  isPerformanceEnded: boolean;
}

export default function PerformanceMoreBtn({
  onClickCheckBtn,
  onClickDeleteBtn,
  onClickEditBtn,
  onClickTerminateBtn,
  isPerformanceEnded,
}: PerformanceMoreBtnProps) {
  return (
    <Card className="w-full border shadow-sm">
      <CardContent className="p-0">
        {/* <PerformanceButton
          label="공연 정보 수정"
          onClick={onClickEditBtn}
          Icon={Pencil}
        /> */}
        <div className="w-full h-px bg-border" />
        <PerformanceButton
          label="예매 확인"
          onClick={onClickCheckBtn}
          Icon={Eye}
        />
        <div className="w-full h-px bg-border" />
        {/* <PerformanceButton
          label="공연 종료"
          Icon={CalendarX}
          onClick={onClickTerminateBtn}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        /> */}
        <div className="w-full h-px bg-border" />
        {isPerformanceEnded && (
          <PerformanceButton
            label="삭제"
            Icon={Trash}
            onClick={onClickDeleteBtn}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          />
        )}
      </CardContent>
    </Card>
  );
}
