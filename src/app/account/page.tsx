import Header from "@/components/home/Header";
import UserInfo from "./UserInfo";
import MyReservation from "./MyReservation";

export default function page() {
  return (
    <>
      <Header />
      <main
        className={`grid w-full py-5 px-6 sm:grid-flow-col sm:grid-rows-1 justify-center`}
      >
        <UserInfo />
        <MyReservation />
      </main>
    </>
  );
}
