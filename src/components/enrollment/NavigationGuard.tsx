// NavigationGuard.tsx
"use client";

import React, { useEffect } from "react";
import { useShowModal } from "@/hooks/useShowModal";
import Modal from "../Modal";
import { Button } from "../controls/Button";
import { useRouter } from "next/navigation";
import { persistor } from "@/redux/store";

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

  const handleConfirmNavigation = async () => {
    handleShowModal(false);
    await persistor.flush();
    persistor.pause();
    onConfirm();
    router.back();
  };

  return (
    <Modal
      isOpen={showModal}
      onClose={() => handleShowModal(false)}
      className="flex gap-4 flex-col items-center"
    >
      <>
        <h2>
          변경사항이 저장되지 않을 수 있습니다. 정말 페이지를 이동하시겠습니까?
        </h2>
        <div className="flex gap-4">
          <Button
            className="px-2"
            type="button"
            onClick={() => handleShowModal(false)}
          >
            아니오
          </Button>
          <Button
            className="px-8"
            highlight
            type="button"
            onClick={handleConfirmNavigation}
          >
            예
          </Button>
        </div>
      </>
    </Modal>
  );
};

export default NavigationGuard;
