interface PerformanceMoreBtnProps {
  iconSrc?: string;
  label?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}

export function PerformanceButton({
  iconSrc,
  label,
  onClick,
  className,
}: PerformanceMoreBtnProps) {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    // 원래의 onClick 함수가 있을 경우 추가적으로 실행
    if (onClick) {
      onClick(event);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`flex justify-center items-center w-full bg-background border-flesh-200 text-foreground py-1.5
          hover:bg-flesh-200 hover:text-foreground hover:border-flesh-200 transition
          active:bg-flesh-300 active:text-foreground active:border-flesh-300
          ${className}`}
    >
      <img src={iconSrc} alt={label} className="w-1/6 mr-1" />
      {label}
    </button>
  );
}

export default function PerformanceMoreBtn({
  onClick,
}: PerformanceMoreBtnProps) {
  return (
    <div className="border-2 border-flesh-200 rounded-md w-[142px] mt-2">
      <PerformanceButton
        iconSrc="/images/icons/pen.svg"
        label="예매 정보 수정"
        onClick={onClick}
      />
      <PerformanceButton
        iconSrc="/images/icons/reading-glasses.svg"
        label="예매 확인"
        className="border-y-2 border-flesh-200 border-dashed"
        onClick={onClick}
      />
      <PerformanceButton
        iconSrc="/images/icons/delete.svg"
        label="삭제"
        onClick={onClick}
      />
    </div>
  );
}
