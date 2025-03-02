"use client";

import { useState, useEffect } from "react";
import { FiAlertCircle, FiCheckCircle, FiX } from "react-icons/fi";

export interface PopupSpec {
  message: string;
  type: "success" | "error" | "info";
  duration?: number;
}

export function Popup({ message, type, onClose }: PopupSpec & { onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor =
    type === "success"
      ? "bg-green-100 border-green-500 text-green-800"
      : type === "error"
      ? "bg-red-100 border-red-500 text-red-800"
      : "bg-blue-100 border-blue-500 text-blue-800";

  const Icon =
    type === "success" ? FiCheckCircle : type === "error" ? FiAlertCircle : FiAlertCircle;

  return (
    <div
      className={`fixed top-4 right-4 z-50 p-4 rounded-md border ${bgColor} shadow-md flex items-center max-w-md`}
    >
      <Icon className="mr-3 flex-shrink-0" />
      <div className="flex-grow">{message}</div>
      <button
        onClick={onClose}
        className="ml-3 flex-shrink-0 text-gray-500 hover:text-gray-700"
      >
        <FiX />
      </button>
    </div>
  );
}

export function usePopup() {
  const [popup, setPopupState] = useState<(PopupSpec & { onClose: () => void }) | null>(
    null
  );

  const setPopup = (spec: PopupSpec) => {
    setPopupState({
      ...spec,
      onClose: () => setPopupState(null),
    });
  };

  return { popup, setPopup };
}