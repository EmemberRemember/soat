"use client";
import React, { useEffect, useState } from "react";
import { EnrollInitialState, EnrollState } from "@/redux/slices/enrollSlice";
import { seatInitialState, SeatState } from "@/redux/slices/seatSlice";
import store, {
  enrollPersistConfig,
  persistor,
  seatPersistConfig,
} from "@/redux/store";
import { getStoredState, REHYDRATE } from "redux-persist";
import { useShowModal } from "@/hooks/useShowModal";
import { Button } from "../controls/Button";
import Modal from "../Modal";

interface EnrollRehydrationProps {
  children: React.ReactNode;
}
export default function EnrollRehydration({
  children,
}: EnrollRehydrationProps) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [enrollStoredState, setEnrollStoredState] = useState<EnrollState>();
  const [seatStoredState, setSeatStoredState] = useState<SeatState>();
  const { showModal, handleShowModal } = useShowModal();
  const { showModal: showErrorModal, handleShowModal: handleShowErrorModal } =
    useShowModal();

  const handleRehydration = () => {
    store.dispatch({
      type: REHYDRATE,
      key: seatPersistConfig.key,
      payload: seatStoredState,
    });
    store.dispatch({
      type: REHYDRATE,
      key: enrollPersistConfig.key,
      payload: enrollStoredState,
    });
    persistor.persist();
    handleShowModal(false);
  };

  const handleDoNotReHydration = () => {
    persistor.purge(); //
    persistor.persist();
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

  const compareStoredStateToInitialState = <
    T extends { _persist?: any; [key: string]: any },
    U extends { isDirty?: boolean; step?: number; [key: string]: any }
  >(
    storedState: T | undefined,
    initialState: U
  ): boolean => {
    if (storedState == undefined) {
      return false;
    }

    const { _persist, ...filteredStoredState } = storedState;
    const {
      isDirty: _isDirty,
      step: _step,
      ...filteredInitialState
    } = initialState;

    if (
      JSON.stringify(filteredInitialState) !==
      JSON.stringify(filteredStoredState)
    ) {
      return true;
    }
    return false;
  };

  useEffect(() => {
    const checkPersistedState = async () => {
      try {
        const enrollStore = (await getStoredState(
          enrollPersistConfig
        )) as EnrollState;
        const seatStore = (await getStoredState(
          seatPersistConfig
        )) as SeatState;

        setEnrollStoredState(enrollStore);
        setSeatStoredState(seatStore);

        if (enrollStore || seatStore) {
          // 저장된 값이 있으면
          if (
            compareStoredStateToInitialState(enrollStore, EnrollInitialState) ||
            compareStoredStateToInitialState(seatStore, seatInitialState)
          ) {
            handleShowModal(true);
          } else {
            persistor.persist();
          }
        } else {
          persistor.persist();
        }
      } catch (err) {
        // 에러 발생 시 처리
        console.error("Failed to get stored state:", err);
        setError("저장된 상태를 불러오는 중 오류가 발생했습니다.");

        // 에러 발생 시에도 앱은 계속 실행되어야 하므로 persist 실행
        handleShowErrorModal(true);
      }
      setIsLoading(false);
    };
    checkPersistedState();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
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
