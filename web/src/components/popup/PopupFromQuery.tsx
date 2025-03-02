import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { usePopup } from "@/components/admin/connectors/Popup";

// Define PopupType locally to match the PopupSpec interface in Popup.tsx
type PopupType = "success" | "error" | "info";

interface PopupConfig {
  [key: string]: {
    message: string;
    type: PopupType;
    duration?: number;
  };
}

export function usePopupFromQuery(popupConfig: PopupConfig) {
  const searchParams = useSearchParams();
  const { popup, setPopup } = usePopup();
  const [hasShownPopup, setHasShownPopup] = useState(false);

  useEffect(() => {
    if (hasShownPopup) return;
    const message = searchParams.get("message");
    if (message && popupConfig[message]) {
      const config = popupConfig[message];
      setPopup({
        message: config.message,
        type: config.type,
      });
      setHasShownPopup(true);
    }
  }, [searchParams, popupConfig, setPopup, hasShownPopup]);

  return { popup };
}

function getPopupStyles(type: PopupType): string {
  switch (type) {
    case "success":
      return "bg-green-50 border-green-200 text-green-800";
    case "error":
      return "bg-red-50 border-red-200 text-red-800";
    case "info":
    default:
      return "bg-blue-50 border-blue-200 text-blue-800";
  }
} 