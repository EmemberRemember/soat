"use client";
import { RootState } from "@/redux/store";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import EnrollSeat from "../write/EnrollSeat";
import { EnrollStep } from "@/types/enrollment";
import EnrollPerformance from "../EnrollPerformance";
import { usePathname, useRouter } from "next/navigation";
import axios, { isAxiosError } from "axios";
import useSetEditEnrollData from "@/hooks/useSetEditEnrollData";
import { PerformanceData } from "@/app/api/performance/route";
import { useSession } from "next-auth/react";

export default function EnrollEditMains() {
  const id = useSelector((state: RootState) => state.enrollEdit.id);
  const step = useSelector((state: RootState) => state.enrollEdit.step);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { setEditEnrollData } = useSetEditEnrollData();
  const { data: sessionData, status: sessionStatus } = useSession();
  const pathname = usePathname();
  const pathSegments = pathname.split('/');
  const performanceId = pathSegments.length > 3 ? pathSegments[3] : undefined; // URL에서 ID 추출
  const router = useRouter();

  useEffect(() => {
    const getPerformanceWithId = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`/api/performance/${performanceId}`);
        const performanceData = response.data.performance as PerformanceData;
        // 세션 데이터가 로드된 후에 판매자 ID 비교
        if (sessionData?.user?.id !== performanceData.sellerId) {
          console.log('세션 데이터 접근', sessionData, sessionData?.user?.id, performanceData.sellerId);
          router.replace('/not-found');
          return; // 권한이 없으면 더 이상 진행하지 않음
        }
        setEditEnrollData(performanceData);
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 404) {
          router.replace('/not-found');
        }
      } finally {
        setIsLoading(false);
      }
    };

    // 세션 상태가 'authenticated' 또는 'unauthenticated'가 된 후에 데이터 fetching 시작
    if (sessionStatus === 'authenticated' || sessionStatus === 'unauthenticated') {
      if (id !== performanceId && performanceId) {
        getPerformanceWithId();
      }
    }
  }, [sessionStatus]);

  if (isLoading || sessionStatus === 'loading') {
    return <div>Loading...</div>;
  }

  return (
    <>
      {step === EnrollStep.EnrollPerformance && <EnrollPerformance isEdit={true} />}
      {step === EnrollStep.EnrollSeats && <EnrollSeat isEdit={true} />}
    </>
  );
}