export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { postsIndex } from "@/lib/algolia";
import { PerformanceData } from "@/app/api/performance/route";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title");
  const category = searchParams.get("category");

  if (
    (!title || title.trim() === "") &&
    (!category || category.trim() === "")
  ) {
    return NextResponse.json(
      { message: "검색 정보를 가져올 수 없습니다." },
      { status: 400 }
    );
  }

  const searchValue: string = (title || category || "").toString();

  try {
    const { hits } = await postsIndex.search<PerformanceData>(searchValue, {
      attributesToRetrieve: [
        "title",
        "content",
        "sellerTeam",
        "category",
        "createdAt",
        "poster",
        "updatedAt",
        "bookingStartDate",
        "bookingEndDate",
        "price",
        "address",
        "detailAddress",
        "ratingSum",
        "ratingCount",
        "performances",
      ],
      hitsPerPage: 10,
    });

    if (hits.length === 0) {
      return NextResponse.json(
        { message: "검색 결과가 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json(hits);
  } catch (error) {
    console.error("검색 오류 :", error);
    return NextResponse.json(
      { message: "검색 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
