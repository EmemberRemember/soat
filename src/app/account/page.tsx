import Header from "@/components/home/Header";
import UserInfo from "@/components/account/UserInfo";
import MyReservation from "@/components/account/MyReservation";

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
      </main>
    </>
  );
}
