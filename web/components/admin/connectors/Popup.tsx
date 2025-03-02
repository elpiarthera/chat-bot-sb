import { useState } from "react";
import { toast } from "sonner";

export type PopupType = "success" | "error" | "info" | "warning";

export interface PopupSpec {
  message: string;
  type: PopupType;
}

export function usePopup() {
  const [popup, setPopup] = useState<PopupSpec | null>(null);
  
  const showPopup = (popupSpec: PopupSpec | { message: string, type?: PopupType }) => {
    // Handle the case where type is not provided
    const fullPopupSpec: PopupSpec = {
      message: popupSpec.message,
      type: popupSpec.type || "info"
    };
    
    setPopup(fullPopupSpec);
    
    // Also show as a toast for immediate feedback
    switch(fullPopupSpec.type) {
      case "success":
        toast.success(fullPopupSpec.message);
        break;
      case "error":
        toast.error(fullPopupSpec.message);
        break;
      case "info":
        toast.info(fullPopupSpec.message);
        break;
      case "warning":
        toast.warning(fullPopupSpec.message);
        break;
    }
    
    // Auto-clear after 5 seconds
    setTimeout(() => setPopup(null), 5000);
  };
  
  return { popup, setPopup: showPopup };
} 