import { useEffect, useState } from "react";
import { ToastContentProps, toast } from "react-toastify";
import { Button } from "../controls/Button";

interface ConfirmProps {
  buttonText: string;
  title: string;
  message: string;
  className?: string;
  onConfirm: () => void;
  highlight?: boolean;
  disabled?: boolean;
}

export default function ToastConfirm({
  buttonText,
  title,
  message,
  className,
  onConfirm,
  highlight,
  disabled,
}: ConfirmProps) {
  const [isClicked, setIsClicked] = useState(false); // 버튼 클릭 여부 상태 관리 값
  const [isConfirmed, setIsConfirmed] = useState(false); // Confirm '예' 버튼 클릭 여부 상태 관리 값 ('예' 클릭 시 버튼 disabled)

  // 버튼 클릭 시 실제 toast(ToastContainer >  ConfirmButtons 컴포넌트)를 띄우는 함수
  const confirm = () => {
    toast(
      (toastProps) => (
        <ConfirmButtons
          {...toastProps}
          setIsClicked={setIsClicked}
          setIsConfirmed={setIsConfirmed}
          title={title}
          message={message}
          onConfirm={onConfirm}
        />
      ),
      {
        // ToastContainer 옵션 제어 부분
        closeButton: false,
        className: "p-0",
        ariaLabel: buttonText + "버튼",
        pauseOnFocusLoss: false,
        onClose: () => {
          setIsClicked(false); // 버튼 클릭되지 않고 toast가 닫힌 경우 상태 초기화
        },
      }
    );
  };

  // Confirm 을 띄우는 버튼 컴포넌트
  return (
    <div className="place-items-center ">
      <Button
        onClick={confirm}
        size="small"
        className="whitespace-nowrap"
        highlight={highlight}
        disabled={isClicked || isConfirmed || disabled}
      >
        {buttonText}
      </Button>
    </div>
  );
}

// ConfirmButtons 컴포넌트 : Toast 내부 구성
function ConfirmButtons({
  closeToast,
  setIsClicked,
  setIsConfirmed,
  title,
  message,
  onConfirm,
}: ToastContentProps & {
  setIsClicked: React.Dispatch<React.SetStateAction<boolean>>;
  setIsConfirmed: React.Dispatch<React.SetStateAction<boolean>>;
  title: string;
  message: string;
  onConfirm: () => void;
}) {
  useEffect(() => {
    setIsClicked(true);
  }, []);

  return (
    <section className="grid grid-cols-[1fr_1px_80px] w-full">
      <div className="flex flex-col p-4">
        <h3 className="text-zinc-800 text-sm font-semibold">{title}</h3>
        <p className="text-sm">{message}</p>
      </div>
      <div className="bg-zinc-900/20 h-full" />
      <div className="grid grid-rows-[1fr_1px_1fr] h-full">
        <button
          onClick={() => {
            setIsConfirmed(true); // Confirm 버튼 클릭 시 상태 변경
            onConfirm(); // 부모 onConfirm 함수 실행
            closeToast(); // Toast 종료
          }}
        >
          네
        </button>
        <div className="bg-zinc-900/20 w-full" />
        <button
          onClick={() => {
            setIsClicked(false);
            closeToast();
          }}
          className="text-flesh-500"
        >
          아니오
        </button>
      </div>
    </section>
  );
}
