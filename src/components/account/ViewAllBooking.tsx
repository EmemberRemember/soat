import { Button } from "@/components/controls/Button";
export default function ViewAllBooking({ className }: { className?: string }) {
  return (
    <Button
      href="/account/mybook"
      size="small"
      className={`border-[1px] border-gray-200 rounded-xl flex gap-2 md:gap-3 items-center text-lg md:text-xl mx-auto my-6 md:my-8 hover:bg-gray-50 active:bg-gray-100 px-6 md:px-8 py-3 md:py-4 ${className}`}
    >
      예매 내역 전체 보기
      <img
        src="/images/icons/next-icon-defaltcolor.svg"
        alt="전체보기"
        className="w-2 md:w-auto"
      />
    </Button>
  );
}
