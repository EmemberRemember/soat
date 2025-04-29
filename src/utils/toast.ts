"use client";
import { toast, ToastPosition } from "react-toastify";

export function showToast(
  message: string,
  type: "success" | "error" | "info" = "info"
) {
  const toastCustomStyle = {
    position: "top-right" as ToastPosition,
    autoClose: 2000,
    hideProgressBar: true,
  };

  if (type === "info") toast(message, toastCustomStyle);
  else if (type === "success") toast.success(message, toastCustomStyle);
  else if (type === "error") toast.error(message, toastCustomStyle);
}
