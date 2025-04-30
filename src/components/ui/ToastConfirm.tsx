import { ToastContainer, ToastContentProps, toast } from "react-toastify";
import { Button } from "../controls/Button";

interface ConfirmProps {
  buttonText: string;
  title: string;
  message: string;
  className?: string;
  onConfirm: () => void;
  highlight?: boolean;
}

export default function ToastConfirm({
  buttonText,
  title,
  message,
  className,
  onConfirm,
  highlight,
}: ConfirmProps) {
  // 버튼 클릭 시 실제 toast(ToastContainer)를 띄우는 함수
  const confirm = () => {
    toast(ConfirmButtons, {
      // toast 세부 속성
      closeButton: false,
      className: "p-0",
      ariaLabel: buttonText + "버튼",
      pauseOnFocusLoss: false,
    });
  };
  // ToastContainer 내부 커스텀 디자인
  function ConfirmButtons({ closeToast }: ToastContentProps) {
    return (
      // using a grid with 3 columns
      <section className="grid grid-cols-[1fr_1px_80px] w-full">
        <div className="flex flex-col p-4">
          <h3 className="text-zinc-800 text-sm font-semibold">{title}</h3>
          <p className="text-sm">{message}</p>
        </div>

        <div className="bg-zinc-900/20 h-full" />
        <div className="grid grid-rows-[1fr_1px_1fr] h-full">
          <button
            onClick={() => {
              closeToast();
              onConfirm();
            }}
          >
            네
          </button>
          <div className="bg-zinc-900/20 w-full" />
          <button onClick={() => closeToast()} className="text-flesh-500">
            아니오
          </button>
        </div>
      </section>
    );
  }
  return (
    <div className="place-items-center ">
      <Button
        onClick={confirm}
        size="small"
        className="whitespace-nowrap"
        highlight={highlight}
      >
        {buttonText}
      </Button>
    </div>
  );
}
