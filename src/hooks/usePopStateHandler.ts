"use client";
import { useEffect, useRef } from "react";

interface usePopStateHandlerProps {
  onHandlePopState: () => void;
}

export const usePopStateHandler = ({
  onHandlePopState,
}: usePopStateHandlerProps) => {
  const isClickedFirst = useRef(false);

  const handlePopState = () => {
    onHandlePopState();
  };

  useEffect(() => {
    if (!isClickedFirst.current) {
      window.history.pushState(null, "", window.location.href);
    }
    isClickedFirst.current = true;
  }, []); //마운트 시 현재 url 을 historyAPI 에 추가

  useEffect(() => {
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);
};
