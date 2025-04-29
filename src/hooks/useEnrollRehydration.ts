// hooks/useEnrollRehydration.ts
import { useEffect, useState } from "react";
import { EnrollInitialState, EnrollState } from "@/redux/slices/enrollSlice";
import { seatInitialState, SeatState } from "@/redux/slices/seatSlice";
import store, {
  enrollPersistConfig,
  persistor,
  seatPersistConfig,
} from "@/redux/store";
import { getStoredState, REHYDRATE } from "redux-persist";
import { clearAllImages } from "@/services/indexedDBService";

type TypeEnrollStoredState = EnrollState;
type TypeSeatStoredState = SeatState;

interface UseEnrollRehydrationProps {
  handleShowModal: (open: boolean) => void;
  handleShowErrorModal: (open: boolean) => void;
}

interface UseEnrollRehydrationResult {
  isLoading: boolean;
  error: string | null;
  handleRehydration: () => void;
  handleDoNotReHydration: () => void;
  handleContinueAnyway: () => void;
  handleRefreshPage: () => void;
}

export const useEnrollRehydration = ({
  handleShowModal,
  handleShowErrorModal,
}: UseEnrollRehydrationProps): UseEnrollRehydrationResult => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [enrollStoredState, setEnrollStoredState] =
    useState<TypeEnrollStoredState>();
  const [seatStoredState, setSeatStoredState] = useState<TypeSeatStoredState>();

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
    persistor.purge();
    persistor.persist();
    clearAllImages();
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
    U extends { isDirty?: boolean; step?: number; [key: string]: any },
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
      invalidField: _invalidField,
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

        const enrollInitial = EnrollInitialState;
        const seatInitial = seatInitialState;

        if (enrollStore || seatStore) {
          if (
            compareStoredStateToInitialState(enrollStore, enrollInitial) ||
            compareStoredStateToInitialState(seatStore, seatInitial)
          ) {
            handleShowModal(true);
          } else {
            persistor.persist();
          }
        } else {
          persistor.persist();
        }
      } catch (err) {
        console.error("Failed to get stored state:", err);
        setError("저장된 상태를 불러오는 중 오류가 발생했습니다.");
        handleShowErrorModal(true);
      }
      setIsLoading(false);
    };
    checkPersistedState();
  }, [handleShowModal, handleShowErrorModal]);

  return {
    isLoading,
    error,
    handleRehydration,
    handleDoNotReHydration,
    handleContinueAnyway,
    handleRefreshPage,
  };
};
