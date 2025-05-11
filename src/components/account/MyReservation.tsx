import ReservationList from "./ReservationList";
import axiosInterceptor from "@/lib/axiosInterceptor";

export default async function MyReservation() {
  const response = await axiosInterceptor("/api/account/book");
  return (
    <div className="flex flex-col relative">
      <ReservationList data={response} dataType="upComing" />
      <ReservationList data={response} dataType="past" />
    </div>
  );
}
