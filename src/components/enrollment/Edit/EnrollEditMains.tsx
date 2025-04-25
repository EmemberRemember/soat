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
  const { data  :sessionData } = useSession()
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { setEditEnrollData } = useSetEditEnrollData()
  const pathname = usePathname();
  const pathSegments = pathname.split('/');
  const performanceId = pathSegments.length > 3 ? pathSegments[3] : undefined; // URL에서 ID 추출
  const router = useRouter();
  
  useEffect(() => {
    const getPerformanceWithId = async () => {
      setIsLoading(true)
      try {
        const response = await axios.get(`/api/performance/${performanceId}`);
        const performanceData = response.data.performance as PerformanceData; 
        if (sessionData?.user.id !== performanceData.sellerId) {
          router.replace('/not-found')
        }
        setEditEnrollData(performanceData)
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 404) {
          router.replace('/not-found')
        }
      } finally {
        setIsLoading(false)
      }
    }
    if (id !== performanceId) {
      getPerformanceWithId();
    }  
  }, [])
    
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {step === EnrollStep.EnrollPerformance && <EnrollPerformance isEdit={true} />}
      {step === EnrollStep.EnrollSeats && <EnrollSeat />}
    </>
  );
}
