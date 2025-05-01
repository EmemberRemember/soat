"use client";
import React, { useState, useCallback } from "react";
import axios from "axios";
import { bookWithPerformance } from "@/types/reservation";

export default function useBookingDetail() {
  const [bookingData, setBookingData] = useState<bookWithPerformance[]>([]);
  const [upComingBookingData, setUpComingBookingData] = useState<
    bookWithPerformance[]
  >([]);
  const [completedBookingData, setCompletedBookingData] = useState<
    bookWithPerformance[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAllBookings = useCallback(async () => {
    if (bookingData.length > 0 && completedBookingData.length > 0)
      return { bookingData, completedBookingData }; // 이미 데이터가 있으면 재사용

    try {
      const response = await axios.get("/api/account/book");
      const data = response.data.sort(
        (a: bookWithPerformance, b: bookWithPerformance) => {
          const dateA = new Date(
            `${a.performanceDate}T${a.performanceTime}:00`
          );
          const dateB = new Date(
            `${b.performanceDate}T${b.performanceTime}:00`
          );
          return dateB.getTime() - dateA.getTime();
        }
      );
      const now = new Date();
      setBookingData(data);
      setUpComingBookingData(
        data
          .filter((bookData: bookWithPerformance) => {
            return (
              now <
              new Date(
                `${bookData.performanceDate}T${bookData.performanceTime}:00`
              )
            );
          })
          .sort((a: bookWithPerformance, b: bookWithPerformance) => {
            const dateA = new Date(
              `${a.performanceDate}T${a.performanceTime}:00`
            );
            const dateB = new Date(
              `${b.performanceDate}T${b.performanceTime}:00`
            );
            return dateA.getTime() - dateB.getTime();
          })
      );
      setCompletedBookingData(
        data.filter((bookData: bookWithPerformance) => {
          return (
            now >
            new Date(
              `${bookData.performanceDate}T${bookData.performanceTime}:00`
            )
          );
        })
      );
      return data;
    } catch (error) {
      console.error("예매 데이터 불러오기 실패", error);
    } finally {
      setIsLoading(false);
    }
  }, [bookingData, completedBookingData]);

  return {
    bookingData,
    upComingBookingData,
    completedBookingData,
    isLoading,
    fetchAllBookings,
  };
}
