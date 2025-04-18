// NavigationGuard.tsx
"use client";

import React, { useEffect } from "react";
import { useShowModal } from "@/hooks/useShowModal";
import Modal from "../Modal";
import { Button } from "../controls/Button";
import { useRouter } from "next/navigation";

interface NavigationGuardProps {
  isDirty?: boolean;
  onConfirm: () => void;
}

const NavigationGuard = ({
  isDirty = false,
  onConfirm,
}: NavigationGuardProps) => {
  const { handleShowModal, showModal } = useShowModal();
  const router = useRouter();
  useEffect(() => {
    history.pushState(null, "", location.href);
  }, []); //마운트 시 현재 url 을 historyAPI 에 추가

  useEffect(() => {
    const handlePopState = () => {
      if (isDirty) {
        handleShowModal(true);
      }
    };
    const handleUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.returnValue = true;
        e.preventDefault();
      }
    };
    window.addEventListener("popstate", handlePopState);
    window.addEventListener("beforeunload", handleUnload);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [handleShowModal, isDirty]);

  const handleConfirmNavigation = () => {
    handleShowModal(false);
    onConfirm();
    router.back();
  };

  return (
    <Modal isOpen={showModal} onClose={() => handleShowModal(false)}>
      <>
        <h2>페이지 이동 확인</h2>
        <p>
          변경사항이 저장되지 않을 수 있습니다. 정말 페이지를 이동하시겠습니까?
        </p>
        <Button type="button" onClick={() => handleShowModal(false)}>
          아니오
        </Button>
        <Button highlight type="button" onClick={handleConfirmNavigation}>
          예
        </Button>
      </>
    </Modal>
  );
};

export default NavigationGuard;
