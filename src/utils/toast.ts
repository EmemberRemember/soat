"use client";
import { toast, ToastPosition } from "react-toastify";

export function showToast(
  message: string,
  type: "success" | "error" | "info" = "info",
  onClose?: () => void
) {
  const toastCustomStyle = {
    role: "alert",
    position: "top-right" as ToastPosition,
    autoClose: 1000,
    hideProgressBar: true,
    pauseOnFocusLoss: false,
    closeButton: false,
  };

  const onCloseToastStyle = {
    ...toastCustomStyle,
    autoClose: 500,
    position: "top-center" as ToastPosition,
    hideProgressBar: false,
  };

  if (type === "info") toast.info(message, toastCustomStyle);
  else if (type === "success") {
    if (onClose) {
      return toast.success(message, {
        ...onCloseToastStyle,
        onClose: onClose,
      });
    } else {
      return toast.success(message, toastCustomStyle);
    }
  } else if (type === "error") {
    if (onClose) {
      return toast.error(message, {
        ...onCloseToastStyle,
        onClose: onClose,
      });
    } else {
      return toast.error(message, toastCustomStyle);
    }
  }
}
