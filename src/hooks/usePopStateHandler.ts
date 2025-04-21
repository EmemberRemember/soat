"use client";
import { useCallback, useEffect, useRef } from "react";

interface usePopStateHandlerProps {
  onHandlePopState: () => void;
  isDirty: boolean;
}

export const usePopStateHandler = ({
  isDirty,
  onHandlePopState,
}: usePopStateHandlerProps) => {
  const isClickedFirst = useRef(false);

  const handlePopState = useCallback(() => {
    onHandlePopState();
  }, [onHandlePopState]);

  useEffect(() => {
    if (!isClickedFirst.current && isDirty) {
      console.log(isDirty, "popstate");
      window.history.pushState(null, "", window.location.href);
      isClickedFirst.current = true;
    }
  }, [isDirty]); //마운트 시 현재 url 을 historyAPI 에 추가

  useEffect(() => {
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [handlePopState]);
};
