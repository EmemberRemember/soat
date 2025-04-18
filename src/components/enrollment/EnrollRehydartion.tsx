"use client";
import { EnrollInitialState } from "@/redux/slices/enrollSlice";
import { enrollPersistConfig, persistor } from "@/redux/store";
import React, { useEffect, useState } from "react";

import { getStoredState } from "redux-persist";
import Modal from "../Modal";
import { Button } from "../controls/Button";
import { useShowModal } from "@/hooks/useShowModal";

interface EnrollRehydrationProps {
  children: React.ReactNode;
}
export default function EnrollRehydration({
  children,
}: EnrollRehydrationProps) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { showModal, handleShowModal } = useShowModal();
  const { showModal: showErrorModal, handleShowModal: handleShowErrorModal } =
    useShowModal();

  const handleRehydration = () => {
    persistor.persist();
    handleShowModal(false);
  };

  const handleDoNotReHydration = () => {
    persistor.purge(); //
    persistor.persist(); // 상태 초기화 후 저장소에 반영
    handleShowModal(false);
  };

  const handleContinueAnyway = () => {
    setError(null);
    persistor.persist();
    handleShowErrorModal(false);
  };

  const handleRefreshPage = () => {
    window.location.reload();
  };

  useEffect(() => {
    const checkPersistedState = async () => {
      try {
        const storedState = (await getStoredState(
          enrollPersistConfig
        )) as typeof EnrollInitialState;

        if (!storedState) {
          // 값이 존재하지 않으면
          persistor.persist();
          setIsLoading(false);
          return;
        }

        // `isDirty, step` 값을 제외한 비교를 위해 필터링
        const {
          isDirty: _isDirty,
          step: _step,
          // _persist: __persist, // 값 오류로 주석처리
          ...filteredStoredState
        } = storedState;
        const {
          isDirty: ignoredIsDirty,
          step: ignoredStep,
          ...filteredInitialState
        } = EnrollInitialState;

        if (
          JSON.stringify(filteredStoredState) ===
          JSON.stringify(filteredInitialState)
        ) {
          persistor.persist();
          setIsLoading(false);
          return; // 동일하면
        }

        handleShowModal(true);
        setIsLoading(false);
      } catch (err) {
        // 에러 발생 시 처리
        console.error("Failed to get stored state:", err);
        setError("저장된 상태를 불러오는 중 오류가 발생했습니다.");

        // 에러 발생 시에도 앱은 계속 실행되어야 하므로 persist 실행
        persistor.persist();
        handleShowErrorModal(true);
        setIsLoading(false);
      }
    };

    checkPersistedState();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Modal
        onClose={() => handleShowModal(false)}
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
