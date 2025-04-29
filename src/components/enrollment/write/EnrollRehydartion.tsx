"use client";
import React from "react";
import { useShowModal } from "@/hooks/useShowModal";
import { Button } from "../../controls/Button";
import Modal from "../../Modal";
import { useEnrollRehydration } from "@/hooks/useEnrollRehydration";
import Loading from "@/components/Loading";

interface EnrollRehydrationProps {
  children: React.ReactNode;
}
export default function EnrollRehydration({
  children,
}: EnrollRehydrationProps) {
  const { showModal, handleShowModal } = useShowModal();
  const { showModal: showErrorModal, handleShowModal: handleShowErrorModal } =
    useShowModal();

  const {
    isLoading,
    error,
    handleRehydration,
    handleDoNotReHydration,
    handleContinueAnyway,
    handleRefreshPage,
  } = useEnrollRehydration({ handleShowModal, handleShowErrorModal });

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <Modal
        onClose={handleDoNotReHydration}
        isOpen={showModal}
        className="flex gap-4 flex-col items-center"
      >
        <>
          <h2>작성중이던 글이 있습니다. 불러오시겠습니까?</h2>
          <div className="flex gap-4">
            <Button className="px-2" onClick={handleDoNotReHydration}>
              아니오
            </Button>
            <Button highlight onClick={handleRehydration} className="px-8">
              예
            </Button>
          </div>
        </>
      </Modal>

      <Modal
        onClose={handleContinueAnyway}
        isOpen={showErrorModal}
        className="flex gap-4 flex-col items-center"
      >
        <>
          <h2 className="text-red-500 font-medium">{error}</h2>
          <p className="text-gray-700 text-center">
            임시 저장된 내용을 불러오는 과정에서 문제가 발생했습니다. 페이지를
            새로고침하면 문제가 해결될 수 있습니다.
          </p>
          <div className="flex gap-4">
            <Button className="px-2" onClick={handleContinueAnyway}>
              무시하고 계속하기
            </Button>
            <Button highlight onClick={handleRefreshPage} className="px-4">
              페이지 새로고침
            </Button>
          </div>
        </>
      </Modal>

      {children}
    </>
  );
}
