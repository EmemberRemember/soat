'use client'
import React, {useState, useCallback} from "react";
import axios from "axios";
import { bookWithPerformance } from "@/types/reservation";

export default function useBookingDetail(){
  const [bookingData, setBookingData] = useState<bookWithPerformance[]>([]);
  const [completedBookingData, setCompletedBookingData] = useState<bookWithPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAllBookings = useCallback(async () => {
    if (bookingData.length > 0 && completedBookingData.length > 0) return { bookingData, completedBookingData }; // 이미 데이터가 있으면 재사용
    
    setIsLoading(true);
    try {
      const response = await axios.get('/api/account/book');
      const data = response.data.reservations.sort((a:bookWithPerformance, b:bookWithPerformance) => {
        const dateA = new Date(`${a.performanceDate}T${a.performanceTime}:00`); 
        const dateB = new Date(`${b.performanceDate}T${b.performanceTime}:00`); 
        return dateB.getTime() - dateA.getTime();
      });
      const now = new Date();
      setBookingData(data)
      setCompletedBookingData(data.filter((bookData : bookWithPerformance)=>{
        return now < new Date(`${bookData.performanceDate}T${bookData.performanceTime}:00`)
      }))     
      return data;
    } catch (error) {
      console.error('예매 데이터 불러오기 실패', error);
    } finally {
      setIsLoading(false);
    }
  }, [bookingData, completedBookingData]);

  return { bookingData, completedBookingData, isLoading, fetchAllBookings };
}
