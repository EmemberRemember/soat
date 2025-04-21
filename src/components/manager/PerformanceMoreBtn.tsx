import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil, Eye, Trash, CalendarX } from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";

interface PerformanceMoreBtnProps {
  label?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  performId: string;
}

export function PerformanceButton({
  label,
  onClick,
  className,
  performId,
}: PerformanceMoreBtnProps) {
  const router = useRouter();
  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    // 원래의 onClick 함수가 있을 경우 추가적으로 실행
    if (onClick) {
      onClick(event);
    }

    // 수정/확인/삭제 버튼 클릭 시 실행되는 로직
    if (label?.includes("수정")) {
      console.log("수정 버튼 클릭됨");
    } else if (label?.includes("확인")) {
      router.push(`/manager/performance/${performId}`);
    } else if (label?.includes("종료")) {
      const endConfirm = confirm("공연을 종료하시겠습니까?");
      if (endConfirm) {
        try {
          const response = await axios.patch(
            `/api/manager/performance/${performId}/end`
          );
          alert("공연이 종료 되었습니다.");
          window.location.reload();
        } catch (error) {
          console.error(error);
        }
      }
    } else if (label?.includes("삭제")) {
      const deleteConfirm = confirm("공연을 삭제하시겠습니까?");
      if (deleteConfirm) {
        try {
          const response = await axios.delete(
            `/api/manager/performance/${performId}/delete`
          );
          alert("공연이 삭제 되었습니다.");
          window.location.reload();
        } catch (error) {
          console.error(error);
        }
      }
    }
  };

  const getIcon = () => {
    if (label?.includes("수정")) {
      return <Pencil className="h-4 w-4 mr-1" />;
    } else if (label?.includes("확인")) {
      return <Eye className="h-4 w-4 mr-1" />;
    } else if (label?.includes("종료")) {
      return <CalendarX className="h-4 w-4 mr-1" />;
    } else if (label?.includes("삭제")) {
      return <Trash className="h-4 w-4 mr-1" />;
    }
    return null;
  };

  return (
    <Button
      variant="ghost"
      onClick={handleClick}
      className={`flex justify-start items-center w-full rounded-none text-sm font-medium py-2 h-auto
      hover:bg-muted hover:text-foreground
      ${className}`}
    >
      {getIcon()}
      {label}
    </Button>
  );
}

export default function PerformanceMoreBtn({
  onClick,
  performId,
}: PerformanceMoreBtnProps) {
  return (
    <Card className="w-full border shadow-sm">
      <CardContent className="p-0">
        <PerformanceButton
          label="공연 정보 수정"
          onClick={onClick}
          performId={performId}
        />
        <div className="w-full h-px bg-border" />
        <PerformanceButton
          label="예매 확인"
          onClick={onClick}
          performId={performId}
        />
        <div className="w-full h-px bg-border" />
        <PerformanceButton
          label="공연 종료"
          onClick={onClick}
          performId={performId}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        />
        <div className="w-full h-px bg-border" />
        <PerformanceButton
          label="삭제"
          onClick={onClick}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          performId={performId}
        />
      </CardContent>
    </Card>
  );
}
