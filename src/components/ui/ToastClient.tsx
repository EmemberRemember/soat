"use client";
import { ToastContainer, Zoom } from "react-toastify";

export default function ToastClient() {
  return <ToastContainer transition={Zoom} style={{ zIndex: 9999 }} />;
}
