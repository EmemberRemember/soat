"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { PerformanceData } from "@/app/api/performance/route";
import Header from "../../../components/home/Header";
import Footer from "../../../components/home/Footer";
import SearchResultItem from "@/components/search/SearchResultItem";
import Loading from "@/components/Loading";

const BookingListPage = () => {
  const [data, setData] = useState<PerformanceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  useEffect(() => {
    axios
      .get<PerformanceData[]>("/api/performance?status=booking")
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        console.error("공연 데이터를 불러오는 데 실패했습니다", err);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // 페이지네이션 처리
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const displayedData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <Header />
      <main>
        <div className="container mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold mb-6">
            현재 예매중인 공연{" "}
            <span className="font-medium">({data.length})</span>
          </h2>

          {isLoading ? (
            <Loading />
          ) : data.length === 0 ? (
            <p className="text-gray-500">현재 예매중인 공연이 없습니다.</p>
          ) : (
            <ul>
              {displayedData.map((show) => (
                <SearchResultItem
                  key={show.id}
                  item={{
                    ...show,
                    objectID: show.id ?? "",
                    ratingCount: 0, // 임시 더미값
                  }}
                />
              ))}
            </ul>
          )}

          <div className="flex justify-center gap-2 px-4 py-6 mb-5 text-[18px]">
            {Array.from({ length: totalPages }, (_, i) => (
              <p
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 cursor-pointer ${
                  currentPage === i + 1
                    ? "text-flesh-600 font-semibold underline"
                    : "text-gray-700"
                }`}
              >
                {i + 1}
              </p>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default BookingListPage;
