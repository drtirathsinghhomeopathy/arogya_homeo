import { createContext, useContext, useState } from "react";
import { TOAST_TYPES } from "../constants/toastTypes";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = (message, type = TOAST_TYPES.INFO) => {
    setToast({ message, type });

    setTimeout(() => {
      setToast(null);
    }, 2500);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-[9999]
            animate-fadeSlideUp scale-burst
            px-4 py-3 rounded-lg text-white shadow-lg font-medium
            ${
              toast.type === TOAST_TYPES.SUCCESS
                ? "bg-primary"
                : toast.type === TOAST_TYPES.ERROR
                ? "bg-red-600"
                : toast.type === TOAST_TYPES.WARNING
                ? "bg-amber-500"
                : "bg-gray-600"
            }
          `}
        >
          {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);