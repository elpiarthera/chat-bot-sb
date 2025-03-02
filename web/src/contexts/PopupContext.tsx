import React, { createContext, useContext, useState, ReactNode } from 'react';

type PopupType = 'success' | 'error' | 'info' | 'warning';

interface PopupState {
  message: string;
  type: PopupType;
  duration?: number;
}

interface PopupContextType {
  popup: ReactNode | null;
  setPopup: (popupState: PopupState | null) => void;
}

const PopupContext = createContext<PopupContextType | undefined>(undefined);

export function PopupProvider({ children }: { children: ReactNode }) {
  const [popup, setPopupState] = useState<ReactNode | null>(null);

  const setPopup = (popupState: PopupState | null) => {
    if (!popupState) {
      setPopupState(null);
      return;
    }

    const { message, type, duration = 5000 } = popupState;

    // Create the popup component
    const popupComponent = (
      <div
        className={`fixed top-4 right-4 z-50 rounded-md p-4 shadow-md ${
          type === 'success'
            ? 'bg-green-100 text-green-800'
            : type === 'error'
            ? 'bg-red-100 text-red-800'
            : type === 'warning'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-blue-100 text-blue-800'
        }`}
      >
        {message}
      </div>
    );

    setPopupState(popupComponent);

    // Auto-dismiss after duration
    setTimeout(() => {
      setPopupState(null);
    }, duration);
  };

  return (
    <PopupContext.Provider value={{ popup, setPopup }}>
      {children}
      {popup}
    </PopupContext.Provider>
  );
}

export function usePopup() {
  const context = useContext(PopupContext);
  if (context === undefined) {
    throw new Error('usePopup must be used within a PopupProvider');
  }
  return context;
}