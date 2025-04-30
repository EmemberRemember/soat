"use client";
import React, { useState } from "react";
import { Button } from "../controls/Button";

const categoryList = ["콘서트", "뮤지컬", "연극", "전시/행사", "팬미팅"];
interface CategoryProps {
  onClick: (category: string) => void;
  selectedItemStr ?: string;
}
export default function Category({ onClick, selectedItemStr = ""}: CategoryProps) {
  
  const [selectItem, setSelectItem] = useState<number>(categoryList.findIndex((categoryitem) => categoryitem === selectedItemStr));
  const handleOnClickCategoryItem = (index: number) => {
    const selectedCategory = categoryList[index];

    if (selectItem === index) {
      setSelectItem(-1); // 선택 해제
      onClick("");
    } else {
      setSelectItem(index); // 새로운 항목 선택
      onClick(selectedCategory); // 부모로 전달
    }
  };

  return (
    <ul className="flex gap-3 items-center whitespace-nowrap">
      {categoryList.map((category, index) => (
        <li key={index}>
          <Button
            className="px-4 md:px-5 py-1 border-2 text-base md:text-lg rounded-lg hover:bg-flesh-300 hover:text-white hover:border-flesh-400 cursor-pointer shrink-0 font-normal"
            highlight={selectItem === index}
            type="button"
            onClick={() => handleOnClickCategoryItem(index)}
          >
            {category}
          </Button>
        </li>
      ))}
    </ul>
  );
}
