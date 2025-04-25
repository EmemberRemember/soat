import React from "react";
import Link from "next/link";
import EnrollEditMains from "@/components/enrollment/Edit/EnrollEditMains";
import EnrollEditFooter from "@/components/enrollment/Edit/EnrollEditFooter";

export default function page() {
  return (
    <>
      <header className="max-w-[1920px] m-auto px-[80px]">
        <Link href={"/"} className="text-flesh-600">
          <h1 className="font-bold text-3xl italic py-5">SO@</h1>
        </Link>
      </header>
      <EnrollEditMains />
      <EnrollEditFooter />
    </>
  );
}
