import React from "react";

export default function Footer() {
  return (
    <footer className="px-4 md:px-[60px] py-[30px] bg-[#1E1E1E] flex flex-col md:flex-row justify-between items-center gap-8 md:gap-4">
      <address className="not-italic w-full md:w-[400px] text-[#E2E2E2]">
        <h2 className="mb-4">
          <img src="/images/icons/logo-temp_GRAY.svg" alt="soat" />
        </h2>
        <dl className="grid grid-cols-[80px_1fr] gap-1">
          <dt className="font-bold">회사명</dt>
          <dd className="m-0">주식회사 쏘앳</dd>

          <dt className="font-bold">대표이사 :</dt>
          <dd className="m-0">
            김지훈,하진희,윤시운,황초희 이휘경,허승범 멘토,김예원,한지현
          </dd>

          <dt className="font-bold">사업자번호 : </dt>
          <dd className="m-0">202 - 50 - 11724</dd>

          <dt className="font-bold">주소 : </dt>
          <dd className="m-0">인천 멘토님댁 어딘가</dd>
        </dl>
        <p className="mt-2 text-sm sm:text-xs sm:absolute">
          {`SO@은 '통신판매중개자'이며, 통신판매의 당사자가 아닙니다. 상품,
          상품정보, 거래에 관한 의무와 책임은 판매자에게 있습니다.`}
        </p>
      </address>

      <section className="w-full md:w-auto">
        <h3 className="text-xl font-bold text-[#E2E2E2] mb-4">고객센터</h3>
        <dl className="grid grid-cols-[100px_1fr] gap-y-3 text-[#E2E2E2]">
          <dt className="font-bold">전화번호</dt>
          <dd className="flex items-center gap-2">
            <a href="tel:1234-5678" className="font-bold text-[#E2E2E2]">
              1234-5678
            </a>
            <span className="text-sm">(유료)</span>
          </dd>

          <dt className="font-bold">운영시간</dt>
          <dd>
            <time>10:00</time> ~ <time>18:00</time>
          </dd>

          <dt className="font-bold">E-mail</dt>
          <dd>
            <a
              href="mailto:support@example.com"
              className="hover:underline text-[#E2E2E2]"
            >
              e-mail : horse@soat.com
            </a>
          </dd>
        </dl>
      </section>

      <section className="w-full md:w-auto">
        <h3 className="sr-only">SNS</h3>
        <ul className="flex gap-[15px] justify-start">
          <li>
            <img src="/images/icons/icon-blog.svg" alt="블로그로 이동" />
          </li>
          <li>
            <img src="/images/icons/icon-insta.svg" alt="안스타그램으로 이동" />
          </li>
          <li>
            <img
              src="/images/icons/icon-facebook.svg"
              alt="페이스북으로 이동"
            />
          </li>
          <li>
            <img src="/images/icons/icon-youtube.svg" alt="유튜브로 이동" />
          </li>
        </ul>
      </section>
    </footer>
  );
}
