"use client";

import { useState, useMemo, useEffect } from "react";
import SearchResultItem from "@/components/search/SearchResultItem";
import SearchOptionFilter from "@/components/search/SearchOptionFilter";
import SortFilter from "@/components/search/SortFilter";
import SearchOptionSection from "@/components/search/SearchOptionSection";
import DesktopSearchOptionSection from "@/components/search/DesktopSearchOptionSection";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import { PerformanceData } from "../api/performance/route";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import Loading from "@/components/Loading";

export interface Item extends PerformanceData {
  objectID: string;
  ratingCount: number;
}

export default function SearchPage() {
  const [isOpenSearchOption, setIsOpenSearchOption] = useState(false);
  const [filterType, setFilterType] = useState<
    "category" | "saleStatus" | null
  >(null);
  const [visibleItems, setVisibleItems] = useState(5); // 모바일: 더보기 버튼 클릭 시 추가 아이템 표시
  const [currentPage, setCurrentPage] = useState(1); // 데스크탑: 페이지네이션 현재 페이지
  const [selectedSortOption, setSelectedSortOption] = useState("최근날짜순"); // 정렬 옵션 상태
  const [selectedCategoryFilters, setSelectedCategoryFilters] = useState<
    string[]
  >([]);
  const [selectedStatusFilters, setSelectedStatusFilters] = useState<string[]>(
    []
  );
  const [isMobile, setIsMobile] = useState(false);
  const [searchDataList, setSearchDataList] = useState<Item[]>([]);
  const searchParams = useSearchParams();
  const title = searchParams.get("title");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setSearchDataList([]); // 검색 결과 초기화
    // url params에 title 값이 없는 경우 fetchData() 미실행
    if (!title || title.trim() === "") {
      return;
    }
    // title 검색 결과를 setSearchDataList 에 저장
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/performance/search", {
          params: { title },
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
    fetchData();
  }, [title]);

  useEffect(() => {
    setIsMobile(window.innerWidth <= 768);

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 정렬 로직
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

  // filteredData 계산 로직
  const filteredData = useMemo(() => {
    return sortedData.filter((item) => {
      // 카테고리 필터 적용 (선택된 필터가 없으면 모두 통과)
      const matchesCategory =
        selectedCategoryFilters.length === 0 ||
        selectedCategoryFilters.includes(item.category);

      // 판매상태별 필터 적용
      const now = new Date();

      let status: "판매예정" | "판매중" | "판매종료";
      if (now < new Date(item.bookingStartDate)) {
        status = "판매예정";
      } else if (now <= new Date(item.bookingEndDate)) {
        status = "판매중";
      } else {
        status = "판매종료";
      }

      const matchesStatus =
        selectedStatusFilters.length === 0 ||
        selectedStatusFilters.includes(status);

      // 두 조건을 모두 만족해야 함
      return matchesCategory && matchesStatus;
    });
  }, [sortedData, selectedCategoryFilters, selectedStatusFilters]);
  const itemsPerPage = 5;
  // 필터링된 데이터에 맞는 총 페이지 수
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // 데스크탑용 페이지네이션 적용
  const displayedDataForDesktop = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredData, currentPage]);

  // 모바일용 더보기 기능 적용
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

  // 필터 핸들러 수정
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

  // 데스크탑 필터 리셋 함수
  function resetFilters(): void {
    setSelectedCategoryFilters([]);
    setSelectedStatusFilters([]);
    setCurrentPage(1);
    setVisibleItems(5);
  }

  // 모바일 필터 리셋 함수
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
          <span className="text-flesh-500">&quot;{title}&quot;</span> 검색
          결과입니다.
        </p>

        {/* 모바일 검색 필터 */}
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

        {/* 데스크탑 검색 필터 */}
        <DesktopSearchOptionSection
          onApply={(filter, type) => handleFilterSelection(filter, type)}
          onClick={resetFilters}
        />
        {/* 검색 정보 */}
        <section className="border-b border-b-gray-300 py-1 flex items-center justify-between">
          <p className="font-semibold">
            공연
            <span className="text-sm  ml-1">({filteredData.length})</span>
          </p>
          <SortFilter
            selectedOption={selectedSortOption}
            setSelectedOption={setSelectedSortOption}
          />
        </section>

        {/* 검색 결과 목록 */}

        {isLoading ? (
          <Loading />
        ) : filteredData.length === 0 ? (
          <p className="text-gray-500 mt-8 text-center">
            검색 결과가 없습니다.
          </p> // 검색 결과가 없을 때 메시지
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

        {/* 모바일: 더보기 버튼 */}
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

        {/* 데스크탑: 페이지네이션 */}
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

      {/* 검색 옵션 필터 모달 */}
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
