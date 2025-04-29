"use client";
import { toast, ToastPosition } from "react-toastify";

export function showToast(
  message: string,
  type: "success" | "error" | "goto" | "info" = "info",
  onClose?: () => void
) {
  const toastCustomStyle = {
    role: "alert",
    position: "bottom-right" as ToastPosition,
    autoClose: 1000,
    hideProgressBar: true,
    pauseOnFocusLoss: false,
    closeButton: false,
  };

  if (type === "info") toast(message, toastCustomStyle);
  else if (type === "success") toast.success(message, toastCustomStyle);
  else if (type === "error") toast.error(message, toastCustomStyle);
  else if (type === "goto")
    toast(message, {
      ...toastCustomStyle,
      position: "top-center" as ToastPosition,
      hideProgressBar: false,
      onClose: onClose,
    });
}
