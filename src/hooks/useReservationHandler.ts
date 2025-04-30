import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { showToast } from "@/utils/toast";
export default function useReservationHandler(showId: string) {
  const router = useRouter();
  const { data: session, status } = useSession();

  return () => {
    if (status !== "authenticated") {
      showToast("로그인이 필요한 기능입니다.", "error");
      return;
    }

    if (session?.user?.userType === "seller") {
      showToast("판매자는 공연을 예약할 수 없습니다.", "error");
      return;
    }

    const popup = window.open(
      `/reservation/${showId}`,
      "reservationPopup",
      `width=600,height=600,left=300,top=300`
    );

    if (popup) {
      popup.focus();
    } else {
      router.push(`/reservation/${showId}`);
    }
  };
}
