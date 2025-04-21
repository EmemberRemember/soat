"use client";
import { persistor, RootState } from "@/redux/store";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import EnrollPerformance from "./EnrollPerformance";
import EnrollSeat from "./EnrollSeat";
import { EnrollStep } from "@/types/enrollment";
import { useDispatch } from "react-redux";
import { resetEnrollState } from "@/redux/slices/enrollSlice";
import { resetSeatState } from "@/redux/slices/seatSlice";

export default function EnrollMains() {
  const dispatch = useDispatch();
  const resetStoreState = () => {
    persistor.pause();
    dispatch(resetEnrollState());
    dispatch(resetSeatState());
  };

  const step = useSelector((state: RootState) => state.enroll.step);

  useEffect(() => {
    return () => {
      resetStoreState();
    };
  }, []);
  return (
    <>
      {step === EnrollStep.EnrollPerformance && <EnrollPerformance />}
      {step === EnrollStep.EnrollSeats && <EnrollSeat />}
    </>
  );
}
