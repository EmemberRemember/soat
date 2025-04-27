import Header from "@/components/home/Header";
import ReservationItemDetail from "@/components/account/ReservationItemDetail";
interface PageParams {
  params: {
    bookId: string;
  };
}

export default function Page({params} : PageParams) {
  const bookId = params.bookId;
  
  return (
    <>
      <Header />
      <main
        className={`relative m-auto w-full pt-5 px-[30px] sm:max-fit md:px-[140px] max-w-[360px] sm:max-w-[1000px]`}
      >
        <ReservationItemDetail bookId={bookId}/>
      </main>
    </>
  );
}
