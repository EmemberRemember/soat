// NavigationGuard.tsx
"use client";
import React from "react";
import { useShowModal } from "@/hooks/useShowModal";
import Modal from "../Modal";
import { Button } from "../controls/Button";
import { useRefreshDetection } from "@/hooks/useRefreshDetection";
import { usePopStateHandler } from "@/hooks/usePopStateHandler";

interface NavigationGuardProps {
  isDirty?: boolean;
}

const NavigationGuard = ({ isDirty = false }: NavigationGuardProps) => {
  const { handleShowModal, showModal } = useShowModal();

  const handlePopState = () => {
    if (isDirty) {
      handleShowModal(true);
    }
  };

  const handleConfirmNavigation = async () => {
    handleShowModal(false);
    window.history.back();
  };

  const handleCancelNavigation = () => {
    handleShowModal(false);
    window.history.pushState(null, "", window.location.href);
  };
  useRefreshDetection();
  usePopStateHandler({ onHandlePopState: handlePopState });

  return (
    <Modal
      isOpen={showModal}
      onClose={handleCancelNavigation}
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
            onClick={handleCancelNavigation}
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
