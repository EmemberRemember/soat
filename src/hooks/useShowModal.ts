"use client";
import { useCallback, useState } from "react";

export const useShowModal = () => {
  const [showModal, setShowModal] = useState<boolean>(false);

  const handleShowModal = useCallback((state: boolean): void => {
    setShowModal(state);
  }, [setShowModal]);

  return { showModal, handleShowModal };
};
