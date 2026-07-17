"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useEffect, useRef } from "react";
import { CheckCircle2, AlertTriangle, XCircle, X } from "lucide-react";

type ToastType = "success" | "warning" | "error";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [isClosing, setIsClosing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const startTimer = useCallback(() => {
    timerRef.current = setTimeout(() => {
      setIsClosing(true);
      setTimeout(() => onRemove(toast.id), 300); // Wait for transition
    }, 4000);
  }, [toast.id, onRemove]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  useEffect(() => {
    startTimer();
    return clearTimer;
  }, [startTimer, clearTimer]);

  const handleClose = () => {
    clearTimer();
    setIsClosing(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  return (
    <div
      onMouseEnter={clearTimer}
      onMouseLeave={startTimer}
      onTouchStart={clearTimer}
      onTouchEnd={startTimer}
      className={`flex items-center gap-3 w-80 p-4 rounded-xl shadow-lg border transition-all duration-300 transform ${
        !isMounted || isClosing ? "opacity-0 translate-x-8" : "opacity-100 translate-x-0"
      } ${
        toast.type === "success"
          ? "bg-emerald-50 border-emerald-200 text-emerald-800"
          : toast.type === "warning"
          ? "bg-amber-50 border-amber-200 text-amber-800"
          : "bg-rose-50 border-rose-200 text-rose-800"
      }`}
    >
      <div className="flex-shrink-0">
        {toast.type === "success" && <CheckCircle2 size={20} className="text-emerald-600" />}
        {toast.type === "warning" && <AlertTriangle size={20} className="text-amber-600" />}
        {toast.type === "error" && <XCircle size={20} className="text-rose-600" />}
      </div>
      <p className="text-sm font-medium flex-1 leading-snug">{toast.message}</p>
      <button
        onClick={handleClose}
        className="p-1 -mr-1 rounded-md hover:bg-stone-200/50 transition-colors opacity-70 hover:opacity-100"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
