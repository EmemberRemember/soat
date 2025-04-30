import Header from "@/components/home/Header";
import ReservationDetail from "@/components/account/ReservationDetail";
interface PageParams {
  params: {
    bookId: string;
  };
}

export default function Page({ params }: PageParams) {
  const bookId = params.bookId;

  return (
    <>
      <Header />
      <main
        className={`relative m-auto w-full px-[30px] sm:max-fit md:px-[140px] max-w-[360px] sm:max-w-[1000px]`}
      >
        <ReservationDetail bookId={bookId} />
      </main>
    </>
  );
}
