import Header from "@/components/home/Header";
import UserInfo from "./UserInfo";
import MyReservation from "./MyReservation";

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
