import Header from "@/components/home/Header";
import UserInfo from "@/components/account/UserInfo";
import MyReservation from "@/components/account/MyReservation";
import ViewAllBooking from "@/components/account/ViewAllBooking";

export default function page() {
  return (
    <>
      <Header />
      <main
        className={`flex flex-col sm:flex-row w-full py-5 px-6 justify-center`}
      >
        <UserInfo />
        <div className="sm:border-r-2 mx-6"></div>
        <MyReservation />
        <ViewAllBooking className="sm:hidden" />
      </main>
    </>
  );
}
