import UserInfoItem from "@/components/account/UserInfoItem";
import Link from "next/link";
import ViewAllBooking from "./ViewAllBooking";
import { Suspense } from "react";
import Loading from "@/components/Loading";

export default async function UserInfo() {
  return (
    <section className="sm:row-span-2 sm:flex sm:flex-col w-full sm:max-w-80">
      <h2 className="font-bold text-sm sm:text-3xl sm:my-6">회원 정보</h2>
      <div className="relative">
        <Suspense fallback={<Loading />}>
          <UserInfoItem />
        </Suspense>
        <Link
          href="/account/edit"
          className="text-flesh-300 underline hover:text-flesh-500 active:text-flesh-800 focus-visible:outline-none focus-visible:text-flesh-500 sm:text-lg absolute bottom-[7px] right-[13px]"
        >
          회원 정보 수정
        </Link>
      </div>
      <ViewAllBooking className="hidden sm:flex" />
    </section>
  );
}
