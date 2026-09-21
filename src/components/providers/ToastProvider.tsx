"use client";

import { createContext, useCallback, useContext, useState, ReactNode } from "react";
import { CheckCircle2, XCircle, X, Info } from "lucide-react";
import clsx from "clsx";

type ToastType = "success" | "error" | "info";
type Toast = { id: number; type: ToastType; message: string };

type ToastContextValue = {
  showToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast deve ser usado dentro de ToastProvider");
  return ctx;
}

const ICONS: Record<ToastType, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const STYLES: Record<ToastType, string> = {
  success: "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-900 dark:text-emerald-300",
  error: "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/60 dark:border-red-900 dark:text-red-300",
  info: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/60 dark:border-blue-900 dark:text-blue-300",
};

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm px-4 sm:px-0">
        {toasts.map((t) => {
          const Icon = ICONS[t.type];
          return (
            <div
              key={t.id}
              className={clsx(
                "flex items-start gap-2.5 rounded-xl border px-4 py-3 shadow-lg animate-fade-in",
                STYLES[t.type]
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <p className="flex-1 text-sm font-medium">{t.message}</p>
              <button onClick={() => dismiss(t.id)} className="opacity-60 hover:opacity-100">
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
