import React from "react";

export default function Footer() {
  return (
    <footer className="bg-[#1E1E1E]">
      <address className="not-italic w-full text-[#E2E2E2]">
        <h2>
          <img
            className="w-1/6 mb-1 pt-1"
            src="/images/icons/logo-temp_GRAY.svg"
            alt="soat"
          />
        </h2>
        <h3 className="text-xl font-bold mb-1">고객지원</h3>
        <dl className="text-xs pb-1">
          <div className="flex">
            <dt className="font-bold mr-1">운영시간</dt>
            <dd>
              <time>10:00</time>~<time>18:00</time>
            </dd>
          </div>
          <div className="flex">
            <dt className="font-bold mr-1">tel:</dt>
            <dd>
              1234-5678 <span>(유료)</span>
            </dd>
          </div>
          <div className="flex">
            <dt className="font-bold mr-1">e-mail:</dt>
            <dd>horse@soat.com</dd>
          </div>
          <div className="flex">
            <dt className="font-bold mr-1">주소:</dt>
            <dd>인천 멘토님댁 어딘가</dd>
          </div>
        </dl>
      </address>
    </footer>
  );
}
