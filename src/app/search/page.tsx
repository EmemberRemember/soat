"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import SearchResultItem from "@/components/search/SearchResultItem";
import SearchOptionFilter from "@/components/search/SearchOptionFilter";
import SortFilter from "@/components/search/SortFilter";
import SearchOptionSection from "@/components/search/SearchOptionSection";
import DesktopSearchOptionSection from "@/components/search/DesktopSearchOptionSection";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import Loading from "@/components/Loading";
import axios from "axios";
import { PerformanceData } from "../api/performance/route";

// 정적 생성을 비활성화하고 동적 렌더링 강제 설정
export const dynamic = "force-dynamic";

export interface Item extends PerformanceData {
  objectID: string;
  ratingCount: number;
}

// SearchParams를 사용하는 컴포넌트
function SearchParamsProvider({ children }: { children: React.ReactNode }) {
  // 여기서 useSearchParams를 사용하면 Suspense 경계 내에서 사용되어야 함
  return children;
}

// 실제 검색 파라미터를 사용하는 컴포넌트
function SearchParamsConsumer() {
  // useSearchParams는 반드시 컴포넌트 최상위 레벨에서 호출되어야 함
  const searchParams = useSearchParams();
  const title = searchParams.get("title");
  const category = searchParams.get("category");

  return <SearchResults title={title} category={category} />;
}

// 검색 결과 컴포넌트
function SearchResults({
  title,
  category,
}: {
  title: string | null;
  category: string | null;
}) {
  const [isOpenSearchOption, setIsOpenSearchOption] = useState(false);
  const [filterType, setFilterType] = useState<
    "category" | "saleStatus" | null
  >(null);
  const [visibleItems, setVisibleItems] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSortOption, setSelectedSortOption] = useState("최근날짜순");
  const [selectedCategoryFilters, setSelectedCategoryFilters] = useState<
    string[]
  >([]);
  const [selectedStatusFilters, setSelectedStatusFilters] = useState<string[]>(
    []
  );
  const [isMobile, setIsMobile] = useState(false);
  const [searchDataList, setSearchDataList] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchData = async (title: string | null, category: string | null) => {
    try {
      const response = await axios.get("/api/performance/search", {
        params: { title, category },
      });

      if (response.status === 200) {
        setSearchDataList(response.data);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("검색 요청 실패:", error.response?.data.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsMobile(window.innerWidth <= 768);

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    setSearchDataList([]);
    if (
      (!title || title.trim() === "") &&
      (!category || category.trim() === "")
    ) {
      return;
    }
    fetchData(title, category);
  }, [title, category]);

  const sortedData = useMemo(() => {
    const sorted = [...searchDataList];
    if (selectedSortOption === "최근날짜순") {
      sorted.sort((a, b) => (a.bookingStartDate > b.bookingStartDate ? -1 : 1));
    } else if (selectedSortOption === "한줄평순") {
      sorted.sort((a, b) => b.ratingCount - a.ratingCount);
    } else if (selectedSortOption === "낮은가격순") {
      sorted.sort((a, b) => a.price - b.price);
    }
    return sorted;
  }, [searchDataList, selectedSortOption]);

  const filteredData = useMemo(() => {
    return sortedData.filter((item) => {
      const matchesCategory =
        selectedCategoryFilters.length === 0 ||
        selectedCategoryFilters.includes(item.category);

      const matchesStatus =
        selectedStatusFilters.length === 0 ||
        new Date() > new Date(item.bookingEndDate);

      return matchesCategory && matchesStatus;
    });
  }, [sortedData, selectedCategoryFilters, selectedStatusFilters]);

  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const displayedDataForDesktop = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredData, currentPage]);

  const displayedDataForMobile = useMemo(() => {
    return filteredData.slice(0, visibleItems);
  }, [filteredData, visibleItems]);

  function loadMoreItems(): void {
    setVisibleItems((prev) => prev + 5);
  }

  function handleSearchOption(option: "category" | "saleStatus"): void {
    setFilterType(option);
    setIsOpenSearchOption(true);
  }

  function handleFilterSelection(
    filter: string,
    type: "category" | "saleStatus"
  ): void {
    if (type === "category") {
      setSelectedCategoryFilters((prev) => {
        if (prev.includes(filter)) {
          return prev.filter((f) => f !== filter);
        } else {
          return [...prev, filter];
        }
      });
    } else if (type === "saleStatus") {
      setSelectedStatusFilters((prev) => {
        if (prev.includes(filter)) {
          return prev.filter((f) => f !== filter);
        } else {
          return [...prev, filter];
        }
      });
    }
  }

  function resetFilters(): void {
    setSelectedCategoryFilters([]);
    setSelectedStatusFilters([]);
    setCurrentPage(1);
    setVisibleItems(5);
  }

  function resetSpecificFilter(type: "category" | "saleStatus"): void {
    if (type === "category") {
      setSelectedCategoryFilters([]);
    } else if (type === "saleStatus") {
      setSelectedStatusFilters([]);
    }
    setCurrentPage(1);
    setVisibleItems(5);
  }

  return (
    <>
      <Header />
      <main className="px-4 md:px-[140px] relative min-h-[100vh]">
        <p className="font-medium">
          <span className="text-flesh-500">
            &quot;{title || category}&quot;
          </span>{" "}
          검색 결과입니다.
        </p>

        <section className="flex items-center gap-[9px]">
          <SearchOptionFilter
            onClick={() => handleSearchOption("category")}
            selectedCount={selectedCategoryFilters.length}
            isActive={filterType === "category" && isOpenSearchOption}
          >
            장르
          </SearchOptionFilter>
          <SearchOptionFilter
            onClick={() => handleSearchOption("saleStatus")}
            selectedCount={selectedStatusFilters.length}
            isActive={filterType === "saleStatus" && isOpenSearchOption}
          >
            판매
          </SearchOptionFilter>
        </section>

        <DesktopSearchOptionSection
          onApply={(filter, type) => handleFilterSelection(filter, type)}
          onClick={resetFilters}
          category={category || ""}
          title={title || ""}
        />

        <section className="border-b border-b-gray-300 py-1 flex items-center justify-between">
          <p className="font-semibold">
            공연
            <span className="text-sm ml-1">({filteredData.length})</span>
          </p>
          <SortFilter
            selectedOption={selectedSortOption}
            setSelectedOption={setSelectedSortOption}
          />
        </section>

        {isLoading ? (
          <Loading />
        ) : filteredData.length === 0 ? (
          <p>검색 결과가 없습니다.</p>
        ) : (
          <section>
            <ul>
              {(isMobile
                ? displayedDataForMobile
                : displayedDataForDesktop
              ).map((item) => (
                <SearchResultItem key={item.objectID} item={item} />
              ))}
            </ul>
          </section>
        )}

        {visibleItems < filteredData.length && isMobile && (
          <section className="md:hidden">
            <button
              onClick={loadMoreItems}
              className="w-full border border-flesh-500 active:bg-gray-100 rounded-xl p-1 text-[13px] text-flesh-500 font-light mt-6 mb-11"
            >
              검색 결과 더보기
            </button>
          </section>
        )}

        {!isMobile && (
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
        )}
      </main>
      <Footer />

      {isOpenSearchOption && (
        <>
          <div
            className="fixed inset-0 bg-black opacity-50 z-10"
            onClick={() => setIsOpenSearchOption(false)}
          ></div>
          <div className="relative z-20">
            <SearchOptionSection
              onClose={() => setIsOpenSearchOption(false)}
              filterType={filterType}
              onApply={(filter, type) => handleFilterSelection(filter, type)}
              onClick={resetSpecificFilter}
              selectedCategoryFilters={selectedCategoryFilters}
              selectedStatusFilters={selectedStatusFilters}
            />
          </div>
        </>
      )}
    </>
  );
}

// 메인 페이지 컴포넌트
export default function SearchPage() {
  return (
    <SearchParamsProvider>
      <Suspense fallback={<Loading />}>
        <SearchParamsConsumer />
      </Suspense>
    </SearchParamsProvider>
  );
}
