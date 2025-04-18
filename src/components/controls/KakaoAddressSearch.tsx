"use client";
import { useCallback, useState } from "react";
import Script from "next/script";
import { KakaoAddressData, KakaoAddressProps } from "@/types/kakao";

const KakaoAddressSearch = ({
  onComplete,
  onClose,
  buttonText = "우편번호 검색",
  className = "break-keep h-fit inline bg-background border-flesh-200 text-foreground border-2 rounded-lg px-4 py-2 w-fit font-bold hover:bg-flesh-200 transition active:bg-flesh-300 active:border-flesh-300 transition focus-visible:bg-flesh-200 focus-visible:border-flesh-200 transition focus:outline-none",
}: KakaoAddressProps) => {
  //로딩 처리 필요
  const [_isScriptLoaded, setIsScriptLoaded] = useState<boolean>(false);
  const handleComplete = useCallback(
    (data: KakaoAddressData) => {
      onComplete({
        address: data.address,
        zonecode: data.zonecode,
        roadAddress: data.roadAddress,
        jibunAddress: data.jibunAddress,
        buildingName: data.buildingName,
      });
    },
    [onComplete]
  );

  const openPostcode = useCallback(() => {
    new window.daum.Postcode({
      oncomplete: handleComplete,
      onclose: onClose,
      width: "100%",
      height: "100%",
    }).open();
  }, [handleComplete, onClose]);

  return (
    <>
      <Script
        src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
        strategy="lazyOnload"
        onLoad={() => setIsScriptLoaded(true)}
      />
      <button type="button" className={className} onClick={openPostcode}>
        {buttonText}
      </button>
    </>
  );
};

export default KakaoAddressSearch;
