import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import ReservationListData from "@/components/account/ReservationItem";

export default function Page({
  searchParams,
}: {
  searchParams: { book?: string };
}) {
  const book = searchParams.book || "total"; // 기본값 설정

  return (
    <>
      <Header />
      <main className={`m-auto w-full pt-[10px] px-[30px] sm:px-[0]`}>
        <section className="m-auto sm:w-[80%] mb-12 lg:pl-[26px]">
          <h2 className="my-[10px] sm:text-3xl sm:my-6 font-bold">
            {book === "total" ? "전체" : "지난"} 예매 내역
          </h2>
          <ReservationListData isViewComplete={book !== "total"} />
        </section>
      </main>
      <Footer />
    </>
  );
}
