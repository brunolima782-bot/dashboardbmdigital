"use client";

import { AlertTriangle, X } from "lucide-react";

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  danger = true,
  loading = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 animate-fade-in" onClick={onCancel} />
      <div className="relative w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-xl animate-fade-in">
        <button
          onClick={onCancel}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
        >
          <X className="h-4 w-4" />
        </button>
        <div
          className={
            danger
              ? "flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400"
              : "flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300"
          }
        >
          <AlertTriangle className="h-5 w-5" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
        {description && (
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{description}</p>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <button className="btn-secondary" onClick={onCancel} disabled={loading}>
            Cancelar
          </button>
          <button
            className={danger ? "btn-danger" : "btn-primary"}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Processando..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
