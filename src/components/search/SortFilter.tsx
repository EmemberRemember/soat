import { useState, useEffect, useRef } from "react";

interface SortFilterProps {
  selectedOption: string;
  setSelectedOption: React.Dispatch<React.SetStateAction<string>>;
}

export default function SortFilter({
  selectedOption,
  setSelectedOption,
}: SortFilterProps) {
  const options = ["최근날짜순", "한줄평순", "낮은가격순"];
  const [isOpenSortFilter, setIsOpenSortFilter] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const toggleSortFilter = () => {
    setIsOpenSortFilter((prev) => !prev);
  };

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    setIsOpenSortFilter(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpenSortFilter(false);
      }
    };

    if (isOpenSortFilter) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpenSortFilter]);

  return (
    <div className="relative inline-block">
      {/* 모바일: 버튼 클릭하면 드롭다운 열림 */}
      <button
        ref={buttonRef}
        onClick={toggleSortFilter}
        className="text-xs pr-2 bg-filter-icon w-[76px] h-[32px] bg-no-repeat bg-right bg-[length:15px] md:hidden"
      >
        {selectedOption}
      </button>

      {/* 모바일: 드롭다운 메뉴 */}
      {isOpenSortFilter && (
        <div
          ref={dropdownRef}
          className="absolute right-[0.5px] w-[93px] rounded-md bg-white text-xs p-3 border border-gray-300 flex flex-col gap-2 shadow-lg md:hidden"
        >
          {options.map((option) => (
            <div
              key={option}
              onClick={() => handleOptionSelect(option)}
              className={`cursor-pointer rounded ${
                selectedOption === option ? "text-flesh-500 font-bold" : ""
              }`}
            >
              {option}
            </div>
          ))}
        </div>
      )}

      {/* 데스크탑: 가로 정렬 */}
      <div className="hidden md:flex gap-4 text-xs">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => handleOptionSelect(option)}
            className={`${
              selectedOption === option ? "text-flesh-500 font-bold" : ""
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
